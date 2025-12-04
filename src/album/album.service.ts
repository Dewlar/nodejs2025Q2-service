import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4, validate } from 'uuid';
import { db } from '../db/db';
import { CreateAlbumDto } from './dto/album.dto';

@Injectable()
export class AlbumService {
  getAlbums() {
    return db.albumDb;
  }

  createAlbum(albumDto: CreateAlbumDto) {
    this.validateAlbumCreate(albumDto);

    const validatedArtistId =
      albumDto.artistId && db.artistsDb.find((a) => a.id === albumDto.artistId)
        ? albumDto.artistId
        : null;

    const albumData = {
      id: uuidv4(),
      name: albumDto.name,
      year: albumDto.year,
      artistId: validatedArtistId,
    };

    db.albumDb.push(albumData);

    return albumData;
  }

  getAlbumById(id: string) {
    return this.validateAlbumId(id);
  }

  updateAlbumById(id: string, updateAlbumDto: CreateAlbumDto) {
    this.validateAlbumId(id);
    this.validateAlbumCreate(updateAlbumDto);

    const index = db.albumDb.findIndex((album) => album.id === id);
    const album = db.albumDb[index];

    const validatedArtistId =
      updateAlbumDto.artistId &&
      db.artistsDb.find((a) => a.id === updateAlbumDto.artistId)
        ? updateAlbumDto.artistId
        : null;

    const newAlbumData = {
      id: album.id,
      name: updateAlbumDto.name || album.name,
      year: updateAlbumDto.year || album.year,
      artistId: validatedArtistId,
    };

    db.albumDb[index] = newAlbumData;

    return db.albumDb[index];
  }

  deleteAlbumById(id: string) {
    this.validateAlbumId(id);

    const index = db.albumDb.findIndex((item) => item.id === id);

    db.trackDb.forEach((track) => {
      if (track.albumId === id) track.albumId = null;
    });
    db.albumDb.splice(index, 1);

    return null;
  }

  private validateAlbumId(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('Id is incorrect - not uuid');
    }

    const album = db.albumDb.find((item) => item.id === id);

    if (!album) {
      throw new NotFoundException('This album is not exist');
    }

    return album;
  }

  private validateAlbumCreate(albumDto: CreateAlbumDto) {
    const { name, artistId, year } = albumDto;

    if (!albumDto || typeof name !== 'string' || typeof year !== 'number') {
      throw new BadRequestException('New album invalid');
    }

    if (typeof artistId !== 'string' && artistId !== null) {
      throw new BadRequestException('Artist for new album invalid');
    }
  }
}
