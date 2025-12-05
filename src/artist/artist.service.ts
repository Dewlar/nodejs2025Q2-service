import { BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

export class ArtistService {
  getArtists() {
    return db.artistsDb;
  }

  createArtist(artistDto: CreateArtistDto) {
    this.validateNameAndGrammy(artistDto);

    const artistData = {
      id: uuidv4(),
      name: artistDto.name,
      grammy: artistDto.grammy,
    };

    db.artistsDb.push(artistData);

    return artistData;
  }

  getArtistById(id: string) {
    return this.validateArtistId(id);
  }

  updateArtistById(id: string, updateArtistDto: UpdateArtistDto) {
    this.validateArtistId(id);
    this.validateUpdateArtist(updateArtistDto);

    const index = db.artistsDb.findIndex((item) => item.id === id);
    const artist = db.artistsDb.find((artist) => artist.id === id);
    const newArtistData = {
      ...artist,
      name: updateArtistDto.name,
      grammy: updateArtistDto.grammy,
    };

    try {
      db.artistsDb[index] = newArtistData;
      return db.artistsDb[index];
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  deleteArtistById(id: string) {
    this.validateArtistId(id);

    const index = db.artistsDb.findIndex((item) => item.id === id);

    if (index === -1) throw new NotFoundException('artist not found');

    db.albumDb.forEach((album) => {
      if (album.artistId === id) album.artistId = null;
    });

    db.trackDb.forEach((track) => {
      if (track.artistId === id) track.artistId = null;
    });

    db.artistsDb.splice(index, 1);

    return 'The record is found and deleted';
  }

  private validateArtistId(id: string) {
    const artist = db.artistsDb.find((item) => item.id === id);

    if (!artist) {
      throw new NotFoundException('This artist is not exist');
    }

    return artist;
  }

  private validateNameAndGrammy(createArtistDto: CreateArtistDto) {
    const { name, grammy } = createArtistDto;

    if (!(name && grammy)) {
      throw new BadRequestException('Artist data is invalid');
    }
  }

  private validateUpdateArtist(updateArtistDto: UpdateArtistDto) {
    const { name, grammy } = updateArtistDto;

    if (
      (!name && !grammy) ||
      (name && typeof name !== 'string') ||
      (grammy && typeof grammy !== 'boolean')
    ) {
      throw new BadRequestException('Artist data is invalid');
    }
  }
}
