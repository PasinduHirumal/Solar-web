import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { StorageModule } from '../../integrations/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    StorageModule,
  ],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
