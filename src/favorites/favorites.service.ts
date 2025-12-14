import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Album } from '../album/type/album-types';
import { PrismaService } from '../db/prisma.service';
import { Artist } from '../generated/prisma/client';
import { Track } from '../track/type/track-types';

@Injectable()
export class FavoritesService {
  constructor(private readonly db: PrismaService) {}

  async getFavorites() {
    const tracks = await this.db.track.findMany({
      where: { isFavorite: true },
    });
    const albums = await this.db.album.findMany({
      where: { isFavorite: true },
    });
    const artists = await this.db.artist.findMany({
      where: { isFavorite: true },
    });

    return {
      tracks: this.resultFav(tracks),
      albums: this.resultFav(albums),
      artists: this.resultFav(artists),
    };
  }

  resultFav(array: Album[] | Track[] | Artist[]) {
    const excludeField = (object: Record<string, any>, keys: string[]) => {
      return Object.fromEntries(
        Object.entries(object).filter(([key]) => !keys.includes(key)),
      );
    };

    return array.map((item) => excludeField(item, ['isFavorite']));
  }

  async addAlbumById(id: string) {
    try {
      const album = await this.db.album.update({
        where: { id },
        data: { isFavorite: true },
      });

      return album;
    } catch (error) {
      throw new UnprocessableEntityException();
    }
  }

  async addArtistById(id: string) {
    try {
      const artist = await this.db.artist.update({
        where: { id },
        data: { isFavorite: true },
      });

      return artist;
    } catch (error) {
      throw new UnprocessableEntityException();
    }
  }

  async addTrackById(id: string) {
    try {
      const track = await this.db.track.update({
        where: { id },
        data: { isFavorite: true },
      });

      return track;
    } catch (error) {
      throw new UnprocessableEntityException();
    }
  }

  async deleteTrackById(id: string) {
    const track = await this.db.track.update({
      where: { id },
      data: { isFavorite: false },
    });

    if (!track) {
      throw new NotFoundException('This track was not found in favorites');
    }

    return;
  }

  async deleteAlbumById(id: string) {
    const album = await this.db.album.update({
      where: { id },
      data: { isFavorite: false },
    });

    if (!album) {
      throw new NotFoundException('This album was not found in favorites');
    }

    return;
  }

  async deleteArtistById(id: string) {
    const artist = await this.db.artist.update({
      where: { id },
      data: { isFavorite: false },
    });

    if (!artist) {
      throw new NotFoundException('This artist was not found in favorites');
    }

    return;
  }
}
