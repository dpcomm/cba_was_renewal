export interface requestRegistTokenDto {
    userId: number,
    token: string,
    platform: string,
}

export interface requestDeleteTokenDto {
    token: string,
}

export interface requestRefreshTokenDto {
    userId: number,
    oldToken: string,
    newToken: string,
    platform: string,
}

export interface Token{
    userId: number,
    token: string,
    platform: string,
}