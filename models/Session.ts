import { Course } from "./Course"
import { User } from "./User"

export type Session = {
    id: string,
    host: User,
    attendees: User[],
    course: Course,
    maxAttendees: number,
}
