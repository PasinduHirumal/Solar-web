import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import smtpConfig from './config/smtp.config';
import cloudinaryConfig from './config/cloudinary.config';
import googleConfig from './config/google.config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { getThrottlerConfig } from './config/throttler.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './config/typeorm.config';
import { AuthenticationModule } from './integrations/authentication/authentication.module';
import { CommunicationModule } from './integrations/communication/communication.module';
import { StorageModule } from './integrations/storage/storage.module';
import { SharedModule } from './shared/shared.module';
import { EventsModule } from './events/events.module';
import { FilesModule } from './modules/files/files.module';
import { IdentityModule } from './modules/identity/identity.module';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { SolarItemsModule } from './modules/solar-items/solar-items.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, smtpConfig, cloudinaryConfig, googleConfig],
    }),

    ScheduleModule.forRoot(),

    EventEmitterModule.forRoot({
      global: true,
      wildcard: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getThrottlerConfig,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),

    AuthenticationModule,
    
    CommunicationModule,
    
    StorageModule,
    
    SharedModule,

    EventsModule,

    FilesModule,

    IdentityModule,

    SolarItemsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    AllExceptionsFilter,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
