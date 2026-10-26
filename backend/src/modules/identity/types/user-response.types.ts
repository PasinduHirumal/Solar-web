import { Exclude, Expose } from "class-transformer";
import { UserRole } from "../enums/user.enum";

@Exclude()
export class UserResponse {
    @Expose() id!: string;
    @Expose() email!: string;
    @Expose() name!: string;
    @Expose() role!: UserRole;
    @Expose() google_id!: string | null;
    @Expose() must_change_password!: boolean;
    @Expose() remember_me!: boolean;
    @Expose() is_anonymous!: boolean;
    @Expose() is_active!: boolean;
    @Expose() created_at!: Date;
    @Expose() updated_at!: Date;

    constructor(partial: Partial<UserResponse>) {
        Object.assign(this, partial);
    }
}