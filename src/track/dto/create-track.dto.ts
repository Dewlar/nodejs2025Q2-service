import { IsString, IsNotEmpty, IsInt, IsUUID } from 'class-validator';

export class CreateTrackDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  artistId: string | null;
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  albumId: string | null;
  @IsInt()
  duration: number;
}
