import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { UserRole } from "../../enums/user.enum";
import { Observable } from "rxjs";

@Injectable()
export class SameUserGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const currentUser = request.user;
        const targetUserId = request.params.user_id;

        if (!currentUser) {
            throw new ForbiddenException('User not authenticated');
        }

        // Allow SUPER_ADMIN to update any profile
        if (currentUser.role === UserRole.SUPER_ADMIN) {
            return true;
        }

        // Otherwise, users can only update their own profile
        if (currentUser.id !== targetUserId) {
            throw new ForbiddenException('You can only access your own data');
        }

        return true;
    }
}