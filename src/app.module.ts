import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlbumModule } from './album/album.module';
import { ArtistModule } from './artist/artist.module';

@Module({
  imports: [ConfigModule.forRoot(), AlbumModule, ArtistModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
