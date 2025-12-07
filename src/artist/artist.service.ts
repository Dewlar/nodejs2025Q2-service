import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Injectable()
export class ArtistService {
  constructor(private readonly db: PrismaService) {}

  async getArtists() {
    const artist = await this.db.artist.findMany();
    return artist;
  }

  async createArtist(artistDto: CreateArtistDto) {
    this.validateNameAndGrammy(artistDto);

    const artist = await this.db.artist.create({
      data: artistDto,
    });

    return artist;
  }

  async getArtistById(id: string) {
    const artist = await this.db.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException('This artist does not exist');
    }

    return artist;
  }

  async updateArtistById(id: string, updateArtistDto: UpdateArtistDto) {
    const artist = await this.db.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException('This artist does not exist');
    }

    this.validateUpdateArtist(updateArtistDto);

    const updatedArtist = await this.db.artist.update({
      where: { id },
      data: updateArtistDto,
    });

    return updatedArtist;
  }

  async deleteArtistById(id: string) {
    const artist = await this.db.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException('This artist does not exist');
    }

    await this.db.album.updateMany({
      where: { artistId: id },
      data: { artistId: null },
    });

    await this.db.track.updateMany({
      where: { artistId: id },
      data: { artistId: null },
    });

    await this.db.artist.delete({
      where: { id },
    });

    return 'The record is found and deleted';
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
