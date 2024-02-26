import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from 'http'
import { URL } from "url";
import { verify } from "jsonwebtoken";
import { DecodedUserFromToken, User } from "models";
import { ConfigReader } from "../config";
import axios, { AxiosResponse } from "axios";
import StatusCode from "status-code-enum";
import { SocketHandler } from "../handlers/interface";
import { GetUserResponse } from "models";
import * as dotenv from 'dotenv';
dotenv.config();

const backendSecret = process.env.SOCKET_SECRET;
const tokenSecret = process.env.JWT_DB_SECRET;

const backendUserID = "backend"

export class SocketServer {
    public static instance: SocketServer
    private io: Server
    private clients: { [userID: string]: Socket }
    private handlers: SocketHandler[]

    constructor(httpServer: HTTPServer, handlers: SocketHandler[]) {
        SocketServer.instance = this

        this.clients = {}

        this.io = new Server(httpServer, {
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
            cors: {
                origin: '*' // Not Secure, but fuck it for now
            }
        })

        this.handlers = handlers
        this.handlers.forEach((handler) => {
            handler.setGlobalListeners(this.io)
        })

        this.io.on('connection', this.authenticateConnection)
        console.log('socket server initialized.')
    }

    private authenticateConnection = async (client: Socket) => {
        console.log('connection request received from: ' + client.id)

        if (client.request.url === undefined) {
            console.log('client connection request did not contain a valid url. Rejecting connection')
            client.disconnect(true)
            return
        }

        let accessToken: string | null = null
        let peerID: string | null = null

        try {
            const url = new URL(client.request.url, `http://${client.request.headers.host}`)
            accessToken = url.searchParams.get("accessToken")
            peerID = url.searchParams.get("peerID")
        } catch (err) {
            console.log('invalid request url from client connection')
        }

        if (accessToken === null) {
            console.log('access token not found in incoming connection request. Rejecting connection')
            client.disconnect(true)
            return
        }

        // Do a check to see if the back-end is the one connecting
        if (accessToken === backendSecret) {
            this.clients[backendUserID] = client
            console.log(`back-end api has successfully authenticated.`)
            return
        }

        if (peerID === null) {
            console.log('peer id not found in incoming connection request. Rejecting connection')
            client.disconnect(true)
            return
        }

        // TODO - Need a better secret
        let decodedUser: any;
        try {
            decodedUser = verify(accessToken, String(tokenSecret))
        } catch (err) {
            console.log('error decoding user credentials: ' + err)
            client.disconnect(true)
            return
        }

        // Pseudo authenticate user by retrieving their profile
        // via our back-end API.
        let response: AxiosResponse<any, GetUserResponse>
        try {
            const backendURL = ConfigReader.instance.BACKEND_API_PROTOCOL
                + ConfigReader.instance.BACKEND_API_HOST
                + ":"
                + ConfigReader.instance.BACKEND_API_PORT
                + "/api/user/"
                + decodedUser.userID
            response = await axios.get<any, AxiosResponse<GetUserResponse>>(backendURL, { timeout: 5000, headers: { "Authorization": `Bearer ${accessToken}` } })
        } catch (err) {
            console.log('error occured when attempting to fetch user account from back-end: ' + err)
            client.disconnect(true)
            return
        }

        // Validate that the back-end returned a valid response
        if (response.status !== StatusCode.SuccessOK) {
            console.log('back-end could not resolve userID. Rejecting connection')
            client.disconnect(true)
            return
        }

        // Convert to regular User model for standardization
        const user: User = {
            id: decodedUser.userID,
            name: decodedUser.username,
            peerID: peerID,
            accessToken: "",
        }

        console.log(user.name + ' has properly been authenticated and is now connected.')
        this.clients[user.id] = client

        // Append our handlers' client listeners to this new
        // client connection
        this.handlers.forEach(handler => {
            handler.setClientListeners(this.io, client, user)
        })

        // Append the server's own client listeners
        this.setClientListeners(client, user)
    }

    private setClientListeners(client: Socket, user: User) {
        client.on('disconnect', this.handleClientDisconnect(user))
    }

    private handleClientDisconnect(user: User): (reason: string) => void {
        return (reason: string) => {
            try {
                console.log(user.id + " disconnected: " + reason)
                delete this.clients[user.id]
            } catch (err) {
                console.log('error occured when attempting to handle client disconnect: ' + err)
            }
        }
    }
}

