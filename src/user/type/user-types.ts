import { IsNotEmpty, IsString } from 'class-validator';

export interface User {
  id: string; // uuid v4
  login: string;
  password: string;
  version: number;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  login: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
