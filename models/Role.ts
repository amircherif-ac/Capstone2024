import { Course } from "./Course"
import { User } from "./User"

export type Tutor = {
    userID: number,
    courseID: number,
    user: User,
    course: Course
}

export type Teacher = {
    userID: number,
    courseID: number,
    user: User,
    course: Course
}