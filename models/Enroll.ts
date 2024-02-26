import { Course } from "./Course"

export type EnrollRequest = {
    userId: number,
    courseId: number,
}

export type UserEnrolledCoursesResponse = {
    courses: EnrolledCourse[]
}

export type EnrolledCourse = {
    userID: number,
    courseID: number,
    isCurrentlyEnrolled: boolean,
    course: Course
}

export type WithdrawRequest = {
    selectedUserId: number,
    courseId: number,
}
