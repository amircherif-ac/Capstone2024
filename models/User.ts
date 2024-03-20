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
    username?: string,
    userPoints?: number,
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
    userPoints: number,
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

//  =================================
// THIS WILL BE USED FOR THE REWARDS PROGRAM
export type points = {
    userID: number,
    userPoints: number,
}