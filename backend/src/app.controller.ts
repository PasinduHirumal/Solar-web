import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHealth(): Promise<object> {
    return this.appService.getHealth();
  }

  @Get('health')
  async getDetailedHealth(): Promise<object> {
    return this.appService.getDetailedHealth();
  }
}
