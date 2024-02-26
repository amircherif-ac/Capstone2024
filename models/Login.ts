export type LoginRequest = {
    email: string;
    username: string;
    schoolID: string;
    password: string;
};

export type LoginResponse = {
    accessToken: string,
    userID: number,
    username: string,
}
