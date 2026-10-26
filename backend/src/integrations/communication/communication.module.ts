import { Module } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { NodemailerModule } from './nodemailer/nodemailer.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [NodemailerModule, SharedModule],
  providers: [CommunicationService],
  exports: [CommunicationService]
})
export class CommunicationModule {}
