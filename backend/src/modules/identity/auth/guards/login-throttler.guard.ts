import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { LoginAttemptService } from "../../../../shared/services/login-attempt.service";

@Injectable()
export class LoginThrottlerGuard implements CanActivate {
    constructor(private readonly loginAttemptService: LoginAttemptService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const email = request.body?.email;

        if (!email) return true;

        const blockCheck = this.loginAttemptService.checkBlock(email);
        if (blockCheck.blocked) {
            throw new HttpException(
                {
                    message: blockCheck.message,
                    retryAfter: blockCheck.retryAfter,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        return true;
    }
}