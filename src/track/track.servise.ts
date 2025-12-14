import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateTrackDto } from './dto/create-track.dto';
import { TypeOperation } from './type/track-types';

@Injectable()
export class TrackService {
  constructor(private readonly db: PrismaService) {}

  async getTracks() {
    const trackDb = await this.db.track.findMany();

    return trackDb;
  }

  async createTrack(trackDto: CreateTrackDto) {
    this.validateArtistAndAlbum(trackDto, TypeOperation.create);

    const track = await this.db.track.create({ data: trackDto });

    return track;
  }

  async getTrackById(id: string) {
    const track = await this.db.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('This track is not exist');
    }

    return track;
  }

  async updateTrackById(id: string, updateTrackDto: UpdateTrackDto) {
    const track = await this.db.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('This track is not exist');
    }

    this.validateArtistAndAlbum(updateTrackDto, TypeOperation.update);

    const updatedTrack = await this.db.track.update({
      where: { id },
      data: updateTrackDto,
    });

    return updatedTrack;
  }

  async deleteTrackById(id: string) {
    const track = await this.db.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('This track is not exist');
    }

    await this.db.track.delete({
      where: { id },
    });
  }

  private validateArtistAndAlbum(
    updateTrackDto: UpdateTrackDto,
    typeOperation: TypeOperation,
  ) {
    const { name, artistId, albumId, duration } = updateTrackDto;

    if (artistId && (typeof artistId !== 'string' || artistId.trim() === '')) {
      throw new BadRequestException('Artist ID must be a non-empty string');
    }

    if (albumId && (typeof albumId !== 'string' || albumId.trim() === '')) {
      throw new BadRequestException('Album ID must be a non-empty string');
    }

    if (typeOperation === TypeOperation.create) {
      if (typeof name !== 'string' || name.trim() === '') {
        throw new BadRequestException('Name must be a non-empty string');
      }

      if (typeof duration !== 'number' || isNaN(duration)) {
        throw new BadRequestException('Duration must be a number');
      }
    }

    if (typeOperation === TypeOperation.update) {
      if (name && (typeof name !== 'string' || name.trim() === '')) {
        throw new BadRequestException('Name must be a non-empty string');
      }

      if (duration && (typeof duration !== 'number' || isNaN(duration))) {
        throw new BadRequestException('Duration must be a number');
      }
    }
  }
}
