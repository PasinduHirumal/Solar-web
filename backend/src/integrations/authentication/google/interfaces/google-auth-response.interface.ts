export interface GoogleOAuthResponse {
    email?: string;
    username?: string;
    picture?: string;
    googleId: string;
}

export interface GoogleOAuthVerifyResponse {
    email: string;
    username?: string;
    picture?: string;
    googleId: string;
}