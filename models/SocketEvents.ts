import { Course } from "./Course"
import { Session } from "./Session"
import { User } from "./User"

// Client -> server events
export const CREATE_SESSION = "CREATE_SESSION"
export const STOP_SESSION = "STOP_SESSION"
export const REQUEST_SESSIONS = "REQUEST_SESSIONS"
export const JOIN_SESSION = "JOIN_SESSION"
export const LEAVE_SESSION = "LEAVE_SESSION"

// Server -> client events
export const CREATE_SESSION_RESPONSE = "CREATE_SESSION_RESPONSE"
export const JOIN_SESSION_RESPONSE = "JOIN_SESSION_RESPONSE"
export const SESSIONS_UPDATE = "SESSIONS_UPDATE"
export const USER_JOINED_SESSION = "USER_JOIN_SESSION"
export const USER_LEAVED_SESSION = "USER_LEAVED_SESSION"
export const HOST_ENDED_SESSION = "HOST_ENDED_SESSION"

export type CreateSessionRequest = {
    course: Course,
    maxAttendees: number,
}

export type CreateSessionResponse = {
    session: Session | null,
    error: string | null,
}

export type EndSessionRequest = {
    sessionID: string
}

export type JoinSessionRequest = {
    sessionID: string
}

export type JoinSessionResponse = {
    session: Session | null,
    error: string | null,
}

export type SessionUpdate = {
    user: User,
    session: Session,
    action: "join" | "leave"
}

export type LeaveSessionRequest = {
    sessionID: string
}
