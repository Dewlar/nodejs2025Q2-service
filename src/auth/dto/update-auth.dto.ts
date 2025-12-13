import { IsOptional, IsString } from 'class-validator';

export class UpdateAuthDto {
  @IsString()
  @IsOptional()
  refreshToken: string | null;
}
