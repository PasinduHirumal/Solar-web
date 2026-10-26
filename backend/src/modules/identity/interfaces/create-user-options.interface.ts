export interface CreateUserOptions {
    googleId?: string | null;
    isAnonymous: boolean;
    mustChangePassword: boolean;
}