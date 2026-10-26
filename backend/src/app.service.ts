import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly configService: ConfigService,
  ) {}

  private async checkDatabase(): Promise<boolean> {
    try {
      if (!this.dataSource.isInitialized) return false;
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Database connection check failed', error);
      return false;
    }
  }
  
  // public - safe for uptime monitors, load balancers, k8s probes
  async getHealth(): Promise<object> {
    const isConnected = await this.checkDatabase();

    return {
      status: isConnected ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  // Detailed, authenticated — internal diagnostics
  async getDetailedHealth(): Promise<object> {
    const port = this.configService.get<string>('PORT');
    const appName = this.configService.get<string>('APP_NAME');
    const environment = this.configService.get<string>('NODE_ENV');
    const dbHost = this.configService.get<string>('database.host');
    const dbName = this.configService.get<string>('database.name');

    const isProduction = environment === 'production';
    const activeOrigins = isProduction
      ? this.configService.get('origins.production')
      : this.configService.get('origins.development');

    const isConnected = await this.checkDatabase();

    this.logger.log(`Database connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);

    return {
      message: `${appName} API is up and running!`,
      status: isConnected ? 'healthy' : 'degraded',
      environment,
      port,
      database: {
        host: dbHost,
        name: dbName,
        connected: isConnected,
      },
      cors: {
        allowedOrigins: activeOrigins,
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
