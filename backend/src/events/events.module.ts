import { Module } from '@nestjs/common';
import { UserEventsService } from './services/user-events.service';
import { UserRegisteredListener } from './listeners/user-registered.listener';
import { CommunicationModule } from '../integrations/communication/communication.module';

@Module({
    imports: [
        CommunicationModule,
    ],
    providers: [
        UserEventsService,
        UserRegisteredListener,
    ],
    exports: [
        UserEventsService,
    ]
})
export class EventsModule {}
