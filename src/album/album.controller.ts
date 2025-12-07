import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { AlbumService } from './album.service';
import { CreateAlbumDto } from './dto/album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get()
  getAlbums() {
    return this.albumService.getAlbums();
  }

  @Get(':id')
  getAlbum(@Param('id', ParseUUIDPipe) id: string) {
    return this.albumService.getAlbumById(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() albumDto: CreateAlbumDto) {
    return this.albumService.createAlbum(albumDto);
  }

  @Put(':id')
  @HttpCode(200)
  updateAlbum(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ) {
    return this.albumService.updateAlbumById(id, updateAlbumDto);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteAlbum(@Param('id', ParseUUIDPipe) id: string) {
    return this.albumService.deleteAlbumById(id);
  }
}
