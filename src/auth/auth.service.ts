import * as bcrypt from 'bcrypt';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async login(user: CreateUserDto) {
    const dbUser = await this.userService.getByLogin(user.login);

    const checkPassword = await bcrypt.compare(user.password, dbUser.password);

    if (!dbUser || !checkPassword) {
      throw new HttpException(
        'No user with this credentials',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.generateAccessAndRefreshTokens({
      userId: dbUser.id,
      login: dbUser.login,
    });
  }

  async signup(createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    return user;
  }

  async refresh(updateAuthDto: UpdateAuthDto) {
    if (!updateAuthDto.refreshToken) {
      throw new UnauthorizedException();
    }

    let login: string;
    let userId: string;

    try {
      const payload: { userId: string; login: string } =
        await this.jwtService.verifyAsync(updateAuthDto.refreshToken, {
          secret: process.env.JWT_SECRET_REFRESH_KEY,
        });

      login = payload.login;
      userId = payload.userId;
    } catch (error) {
      throw new HttpException('Authentication failed ', HttpStatus.FORBIDDEN);
    }

    return await this.generateAccessAndRefreshTokens({ login, userId });
  }

  private async generateAccessAndRefreshTokens(payload: {
    userId: string;
    login: string;
  }) {
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.TOKEN_EXPIRE_TIME,
      } as JwtSignOptions),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET_REFRESH_KEY,
        expiresIn: process.env.TOKEN_REFRESH_EXPIRE_TIME,
      } as JwtSignOptions),
    };
  }
}
