import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlbumModule } from './album/album.module';
import { ArtistModule } from './artist/artist.module';
import { PrismaModule } from './db/prisma.module';
import { FavoritesModule } from './favorites/favorites.module';
// import { HttpExceptionFilter } from './filters/http-exception/http-exception.filter';
import { LoggerMiddleware } from './logger/logger.middleware';
import { TrackModule } from './track/track.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from './logger/logger.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AlbumModule,
    ArtistModule,
    FavoritesModule,
    TrackModule,
    UserModule,
    PrismaModule,
    LoggerModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
