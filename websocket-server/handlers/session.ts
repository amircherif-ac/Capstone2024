import { Server, Socket } from "socket.io";
import { v4 as generateRandomUUID } from "uuid";
import {
    CreateSessionRequest,
    CreateSessionResponse,
    EndSessionRequest,
    JoinSessionRequest,
    JoinSessionResponse,
    Session,
    User,
    SessionUpdate,
    LeaveSessionRequest
} from "models";
import { SocketHandler } from "./interface";
import {
    CREATE_SESSION,
    STOP_SESSION,
    REQUEST_SESSIONS,
    JOIN_SESSION,
    LEAVE_SESSION,
    SESSIONS_UPDATE,
    CREATE_SESSION_RESPONSE,
    HOST_ENDED_SESSION,
    USER_JOINED_SESSION,
    JOIN_SESSION_RESPONSE,
    USER_LEAVED_SESSION,
} from "models"

export class SessionHandler implements SocketHandler {
    private sessions: { [sessionID: string]: Session }
    private usersInLiveSessions: { [userID: string]: User }

    constructor() {
        this.sessions = {}
        this.usersInLiveSessions = {}
    }

    // No-op for the session handler
    public setGlobalListeners(io: Server): void { }

    public setClientListeners(io: Server, client: Socket, user: User): void {
        client.on(CREATE_SESSION, this.handleCreateSession(io, client, user))
        client.on(STOP_SESSION, this.handleEndSession(io, client, user))
        client.on(REQUEST_SESSIONS, this.handleRequestOnlineSessions(client))
        client.on(JOIN_SESSION, this.handleJoinSession(io, client, user))
        client.on(LEAVE_SESSION, this.handleLeaveSession(io, client, user))
        client.on('disconnect', this.handleDisconnects(io, client, user))
    }

    private handleDisconnects(io: Server, client: Socket, user: User): () => void {
        return () => {
            console.log(`lost connection to user id ${user.id}`)

            delete this.usersInLiveSessions[user.id]
            Object.keys(this.sessions).forEach((sessionID) => {
                const attendeeIdxToRemove = this.sessions[sessionID].attendees.findIndex((attendee) => {
                    if (attendee.id === user.id) {
                        return true
                    }
                    return false
                })

                if (attendeeIdxToRemove !== -1) {
                    console.log(`user id ${user.id} has been removed from session ${sessionID} due to disconnection`)
                    this.sessions[sessionID].attendees.splice(attendeeIdxToRemove, 1)
                }

                // Let other users in the session know that
                // this user has left
                client.to(sessionID).emit(USER_LEAVED_SESSION,
                    { user: user, session: this.sessions[sessionID], action: 'leave' } as SessionUpdate)


                // If the host of a session has disconnected, terminate the session
                // and disconnect all the clients from the session
                if (this.sessions[sessionID].host.id === user.id) {
                    console.log(`session ${sessionID} has been terminated due to lost connection to host user id ${user.id}`)
                    client.leave(sessionID)
                    io.to(sessionID).emit(HOST_ENDED_SESSION)
                    io.socketsLeave(sessionID)

                    this.sessions[sessionID].attendees.forEach((user) => {
                        delete this.usersInLiveSessions[user.id]
                    })

                    delete this.sessions[sessionID]
                }
            })

            this.broadcastLiveSessions(io)
        }
    }

    private handleRequestOnlineSessions(client: Socket): () => void {
        return () => {
            let sessionArray: Session[] = []
            Object.keys(this.sessions).forEach((sessionID) => {
                sessionArray.push(this.sessions[sessionID])
            })
            client.emit(SESSIONS_UPDATE, sessionArray)
        }
    }

    private handleCreateSession(io: Server, client: Socket, user: User): (request: CreateSessionRequest) => void {
        return (request: CreateSessionRequest) => {

            // Check if the user is not already in a live session
            if (this.usersInLiveSessions[user.id] !== undefined) {
                client.emit(CREATE_SESSION_RESPONSE, { session: null, error: "user already in another live session" } as CreateSessionResponse)
                return
            }

            let newSession: Session = {
                host: user,
                id: generateRandomUUID(),
                attendees: [],
                course: request.course,
                maxAttendees: request.maxAttendees,
            }

            this.sessions[newSession.id] = newSession
            this.usersInLiveSessions[user.id] = user
            client.join(newSession.id)
            client.emit(CREATE_SESSION_RESPONSE, { session: newSession } as CreateSessionResponse)
            this.broadcastLiveSessions(io)

            console.log('userID ' + user.id + " created session " + newSession.id)
        }
    }

    private handleEndSession(io: Server, client: Socket, user: User): (request: EndSessionRequest) => void {
        return (request: EndSessionRequest) => {
            this.sessions[request.sessionID].attendees.forEach((user) => {
                delete this.usersInLiveSessions[user.id]
            })

            delete this.sessions[request.sessionID]
            delete this.usersInLiveSessions[user.id]
            client.leave(request.sessionID)
            io.to(request.sessionID).emit(HOST_ENDED_SESSION)
            io.socketsLeave(request.sessionID)
            this.broadcastLiveSessions(io)

            console.log('userID ' + user.id + " ended session " + request.sessionID)
        }
    }

    private handleJoinSession(io: Server, client: Socket, user: User): (request: JoinSessionRequest) => void {
        return (request: JoinSessionRequest) => {
            // Handle the case where the sessionID does not exist
            if (this.sessions[request.sessionID] === undefined) {
                client.emit(JOIN_SESSION_RESPONSE, { session: null, error: "session does not exist" } as JoinSessionResponse)
                return
            }

            // Check if the session is full
            if (this.sessions[request.sessionID].attendees.length === this.sessions[request.sessionID].maxAttendees) {
                client.emit(JOIN_SESSION_RESPONSE, { session: null, error: "session is full" } as JoinSessionResponse)
                return
            }

            // Check if the user is not already in another live session
            if (this.usersInLiveSessions[user.id] !== undefined) {
                client.emit(JOIN_SESSION_RESPONSE, { session: null, error: "user already in another live session" } as JoinSessionResponse)
                return
            }

            client.join(request.sessionID)

            this.sessions[request.sessionID].attendees.push(user)
            this.usersInLiveSessions[user.id] = user
            this.broadcastLiveSessions(io)

            // Let every other user in that room know
            // that a new user has joined the session
            client.to(request.sessionID).emit(USER_JOINED_SESSION,
                { user: user, session: this.sessions[request.sessionID], action: 'join' } as SessionUpdate)

            // Respond to the client with the session information
            client.emit(JOIN_SESSION_RESPONSE, { session: this.sessions[request.sessionID], error: null } as JoinSessionResponse)

            console.log('userID ' + user.id + " joined session " + request.sessionID)
        }
    }

    private handleLeaveSession(io: Server, client: Socket, user: User): (request: LeaveSessionRequest) => void {
        return (request: LeaveSessionRequest) => {
            client.leave(request.sessionID)

            // Handle the case where the sessionID does not exist
            if (this.sessions[request.sessionID] === undefined) {
                return
            }

            const attendeeIdxToRemove = this.sessions[request.sessionID].attendees.findIndex((attendee) => {
                if (attendee.id === user.id) {
                    return true
                }
                return false
            })

            // Handle cases where this user was not actually in that session.
            // Should not ever happen, in theory.
            if (attendeeIdxToRemove === -1) {
                console.log('attempt to leave a session failed: user not an attendee')
                return
            }

            // Remove the user from the attendee list
            this.sessions[request.sessionID].attendees.splice(attendeeIdxToRemove, 1)
            delete this.usersInLiveSessions[user.id]

            this.broadcastLiveSessions(io)

            // Let other users in the session know that
            // this user has left
            client.to(request.sessionID).emit(USER_LEAVED_SESSION,
                { user: user, session: this.sessions[request.sessionID], action: 'leave' } as SessionUpdate)

            console.log('userID ' + user.id + " left session " + request.sessionID)
        }
    }

    private broadcastLiveSessions(io: Server) {
        let sessionArray: Session[] = []
        Object.keys(this.sessions).forEach((sessionID) => {
            sessionArray.push(this.sessions[sessionID])
        })
        io.emit(SESSIONS_UPDATE, sessionArray)
    }
}
