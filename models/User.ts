export type User = {
    name: string,
    id: string,
    peerID: string,
    accessToken?: string
    firstName?: string,
    lastName?: string,
    email?: string,
    roleID?: string,
    role?: string,
    username?: string
}

export type GetUserResponse = {
    userID: number,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    schoolID: string,
    passwordHASH: string, // Why are we returning the user's hashed password?
    registeredAT: string,
    lastLogin: string,
    roleID: string,
    role: string,
}

export type DecodedUserFromToken = {
    id: string,
    username: string
}

export type UpdateUserRequest = {
    userId: number,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    schoolId: string,
    roleId: string,
}

export type GetEnrolledUsersResponse = {
    enrollees: EnrolledUser[],
}

export type EnrolledUser = {
    userID: number,
    courseID: number,
    user: User,
}

export type Role = {
    roleId: number,
    roleName: string,
}