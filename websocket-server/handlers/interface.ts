import { Server, Socket } from "socket.io";
import { User } from "models";

export interface SocketHandler {
    setGlobalListeners(io: Server): void
    setClientListeners(io: Server, client: Socket, user: User): void
}
