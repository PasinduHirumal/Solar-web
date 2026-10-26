import { UserResponse } from "../types/user-response.types";

export interface AuthResponse {
    user: UserResponse;
    accessToken: string;
    refreshToken: string;
}