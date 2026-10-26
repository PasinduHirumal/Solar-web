import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UserEntity } from "../../modules/identity/entities/user.entity";
import { UserRole } from "../../modules/identity/enums/user.enum";

export interface UserRegisteredEvent {
    user: {
        id: string,
        email: string,
        name: string,
        role: UserRole,
    },
    timeStamp: Date,
}

@Injectable()
export class UserEventsService {
    constructor(
        private readonly eventEmitter: EventEmitter2,
    ) {}

    emitUserRegistered(user: UserEntity): void {
        const eventData: UserRegisteredEvent = {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            timeStamp: new Date()
        }

        this.eventEmitter.emit('user.registered', eventData);
    }
}