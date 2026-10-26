import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { GoogleOAuthModule } from './google/google.module';

@Module({
  imports: [GoogleOAuthModule],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
