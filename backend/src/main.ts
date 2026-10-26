import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { CorsOptions, CorsOptionsDelegate } from 'cors';
import { getAllowedOrigins } from './config/cors.config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/login.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose']
  });

  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: isProduction ? undefined: false,
    crossOriginEmbedderPolicy: false,
  }));
  
  app.use(cookieParser());

  const corsOptionsDelegate: CorsOptionsDelegate<any> = (req, callback) => {
    const origin = req.headers.origin;
    const allowed = getAllowedOrigins(configService, isProduction);

    const corsOptions: CorsOptions = {
      origin: !origin || allowed.includes(origin),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    };
    callback(null, corsOptions);
  };

  app.enableCors(corsOptionsDelegate);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
      exceptionFactory: (errors) => {
        const messages = errors.flatMap(err =>
          Object.values(err.constraints ?? {})
        );

        return new BadRequestException(messages);
      },
    }),
  );

  app.useGlobalFilters(
    app.get(AllExceptionsFilter),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: false
    }),
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  const PORT = configService.get<number>('PORT') || 5000;
  await app.listen(PORT, '0.0.0.0');
}
bootstrap();
