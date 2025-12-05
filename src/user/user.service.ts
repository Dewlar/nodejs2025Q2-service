import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-user.dto';

export class UserService {
  getUsers() {
    return db.usersDb;
  }

  createUser(userDto: CreateUserDto) {
    if (!(userDto.login && userDto.password)) {
      throw new BadRequestException('Invalid data');
    }

    const newUser = {
      id: uuidv4(),
      login: userDto.login,
      password: userDto.password,
      version: 1,
      createdAt: Number(Date.now()),
      updatedAt: Number(Date.now()),
    };
    db.usersDb.push(newUser);

    const { ...rest } = newUser;
    delete rest.password;

    return rest;
  }

  getUserById(id: string) {
    return this.validateUserId(id);
  }

  updateUserById(id: string, updateUserDto: UpdatePasswordDto) {
    if (
      !(updateUserDto.oldPassword && updateUserDto.newPassword) ||
      typeof updateUserDto.oldPassword !== 'string' ||
      typeof updateUserDto.newPassword !== 'string'
    ) {
      throw new BadRequestException('Invalid data');
    }

    const oldUser = this.validateUserId(id);

    if (updateUserDto.oldPassword !== oldUser.password) {
      throw new ForbiddenException('Old password is wrong');
    }

    const version = oldUser.version + 1;

    const newUser = {
      ...oldUser,
      password: updateUserDto.newPassword,
      version: version,
      updatedAt: Number(Date.now()),
    };

    const index = db.usersDb.findIndex((item) => item.id === id);
    db.usersDb[index] = newUser;

    const returnNewUser = JSON.parse(JSON.stringify(newUser));
    delete returnNewUser.password;

    return returnNewUser;
  }

  deleteUserById(id: string) {
    this.validateUserId(id);

    const index = db.usersDb.findIndex((item) => item.id === id);

    db.usersDb.splice(index, 1);

    return 'The record is found and deleted';
  }

  private validateUserId(id: string) {
    const user = db.usersDb.find((item) => item.id === id);

    if (!user) {
      throw new NotFoundException('This user is not exist');
    }

    return user;
  }
}
