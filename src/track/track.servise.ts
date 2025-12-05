import { BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateTrackDto } from './dto/create-track.dto';
import { TypeOperation } from './type/track-types';

export class TrackService {
  getTracks() {
    return db.trackDb;
  }

  createTrack(trackDto: CreateTrackDto) {
    this.validateArtistAndAlbum(trackDto, TypeOperation.create);

    const trackData = {
      id: uuidv4(),
      name: trackDto.name,
      duration: trackDto.duration,
      artistId: trackDto?.artistId || null,
      albumId: trackDto?.albumId || null,
    };

    db.trackDb.push(trackData);

    return trackData;
  }

  getTrackById(id: string) {
    return this.validateTrackId(id);
  }

  updateTrackById(id: string, updateTrackDto: UpdateTrackDto) {
    this.validateTrackId(id);
    this.validateArtistAndAlbum(updateTrackDto, TypeOperation.update);

    const index = db.trackDb.findIndex((item) => item.id === id);
    const updatedTrack = { ...db.trackDb[index], ...updateTrackDto };

    db.trackDb[index] = updatedTrack;

    return updatedTrack;
  }

  deleteTrackById(id: string) {
    this.validateTrackId(id);

    const index = db.trackDb.findIndex((item) => item.id === id);

    db.trackDb.splice(index, 1);

    return 'The record is found and deleted';
  }

  private validateTrackId(id: string) {
    const track = db.trackDb.find((item) => item.id === id);

    if (!track) {
      throw new NotFoundException('This track is not exist');
    }

    return track;
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
