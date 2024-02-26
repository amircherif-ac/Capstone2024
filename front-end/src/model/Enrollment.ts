export type GetEnrolledUsersResponse = {
    enrollees: EnrolledUser[],
}

export type EnrolledUser = {
    courseID: number,
    Role: String,
    user: User,
}

export type User = {
    userID: number,
    username: string,
    firstName?: string,
    lastName?: string,
    email?: string,
}