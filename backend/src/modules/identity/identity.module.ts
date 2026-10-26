import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { RolesGuard } from './auth/guards/roles.guard';
import { LoginThrottlerGuard } from './auth/guards/login-throttler.guard';
import { AuthenticationModule } from '../../integrations/authentication/authentication.module';
import { CommunicationModule } from '../../integrations/communication/communication.module';
import { SharedModule } from '../../shared/shared.module';
import { SameUserGuard } from './auth/guards/same-user.guard';
import { AuthHelperService } from './auth/helpers/auth-helper.service';
import { UserExistsPipe } from './users/pipes/user-exists.pipe';
import { EventsModule } from '../../events/events.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule,
    AuthenticationModule,
    CommunicationModule,
    SharedModule,
    EventsModule,
  ],
  controllers: [
    AuthController, 
    UsersController,
  ],
  providers: [
    AuthService, 
    UsersService,
    JwtStrategy,
    RolesGuard,
    LoginThrottlerGuard,
    SameUserGuard,
    AuthHelperService,
    UserExistsPipe,
  ],
  exports: [
    AuthHelperService, 
    UsersService, 
    RolesGuard,
  ]
})
export class IdentityModule {}
