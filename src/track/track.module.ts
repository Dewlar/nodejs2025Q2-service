import { Module } from '@nestjs/common';
import { TrackController } from './track.controller';
import { TrackService } from './track.servise';

@Module({
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
