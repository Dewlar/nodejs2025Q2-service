import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';
import { PrismaService } from '../db/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly db: PrismaService) {}

  async getUsers() {
    const users = await this.db.user.findMany();
    return users;
  }

  async createUser(userDto: CreateUserDto) {
    if (!(userDto.login && userDto.password)) {
      throw new BadRequestException('Invalid data');
    }
    userDto.password = await bcrypt.hash(
      userDto.password,
      +process.env.CRYPT_SALT,
    );

    const user = await this.db.user.create({ data: userDto });

    const newUser = omit(user, ['password']);

    return {
      ...newUser,
      createdAt: new Date(newUser.createdAt).getTime(),
      updatedAt: new Date(newUser.updatedAt).getTime(),
    };
  }

  async getUserById(id: string) {
    const user = await this.db.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    const newUser = omit(user, ['password']);

    return {
      ...newUser,
      createdAt: new Date(newUser.createdAt).getTime(),
      updatedAt: new Date(newUser.updatedAt).getTime(),
    };
  }

  async updateUserById(id: string, updateUserDto: UpdatePasswordDto) {
    if (
      !(updateUserDto.oldPassword && updateUserDto.newPassword) ||
      typeof updateUserDto.oldPassword !== 'string' ||
      typeof updateUserDto.newPassword !== 'string'
    ) {
      throw new BadRequestException('Invalid data');
    }

    const user = await this.db.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    const checkPassword = await bcrypt.compare(
      updateUserDto.oldPassword,
      user.password,
    );

    if (!checkPassword) {
      throw new ForbiddenException('Old password is wrong');
    }

    const updatedUser = await this.db.user.update({
      where: { id: id },
      data: {
        password: await bcrypt.hash(
          updateUserDto.newPassword,
          +process.env.CRYPT_SALT,
        ),
        version: { increment: 1 },
      },
    });

    const newUser = omit(updatedUser, ['password']);

    return {
      ...newUser,
      createdAt: new Date(newUser.createdAt).getTime(),
      updatedAt: new Date(newUser.updatedAt).getTime(),
    };
  }

  async deleteUserById(id: string) {
    const user = await this.db.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('This user is not exist');
    }

    await this.db.user.delete({
      where: { id },
    });
  }

  async getByLogin(login: string) {
    const user = await this.db.user.findFirst({
      where: { login: login },
    });

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    return user;
  }
}
