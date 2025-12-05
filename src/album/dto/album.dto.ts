import { IsString, IsNotEmpty, IsInt, IsUUID } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsInt()
  year: number;
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  artistId: string | null;
}
