import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CommunicationService } from "../../integrations/communication/communication.service";
import type { UserRegisteredEvent } from "../services/user-events.service";

@Injectable()
export class UserRegisteredListener {
    private readonly logger = new Logger(UserRegisteredListener.name);

    constructor(private readonly mailService: CommunicationService) {}

    @OnEvent('user.registered')
    async handleUserRegisteredEvent(event: UserRegisteredEvent): Promise<void> {
        const {user, timeStamp} = event;

        try {
            this.logger.log(`Welcome, ${user.email}! Your account created at ${timeStamp.toISOString()}`);

            await this.mailService.sendWelcomeEmail(user.email, user.name, user.role);
        } catch (error) {
            // Important: a failure here should NOT crash the app or affect
            // the original registration — the user is already created.
            this.logger.error(`Failed to send welcome email to ${user.email}`, error);
        }
    }
}