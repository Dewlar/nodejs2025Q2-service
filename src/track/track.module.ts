import { Module } from '@nestjs/common';
import { PrismaModule } from '../db/prisma.module';
import { TrackController } from './track.controller';
import { TrackService } from './track.servise';

@Module({
  imports: [PrismaModule],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
