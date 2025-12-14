import { Module } from '@nestjs/common';
import { PrismaModule } from '../db/prisma.module';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AlbumController],
  providers: [AlbumService],
})
export class AlbumModule {}
