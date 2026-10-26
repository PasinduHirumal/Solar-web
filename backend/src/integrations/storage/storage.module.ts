import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    CloudinaryModule,
    MulterModule.register({
      storage: memoryStorage()
    }),
  ],
  providers: [StorageService],
  exports: [StorageService]
})
export class StorageModule {}
