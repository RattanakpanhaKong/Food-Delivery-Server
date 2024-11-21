import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { Response } from 'express';

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // register user service
  async register(registerDto: RegisterDto, response: Response) {
    const { name, email, password, phone_number } = registerDto;

    const isEmailExist = await this.prisma.user.findUnique({
      where: { email },
    });

    if (isEmailExist) {
      throw new BadRequestException('Email exists');
    }

    const isPhoneNumberExist = await this.prisma.user.findUnique({
      where: {
        phone_number,
      },
    });

    if (isPhoneNumberExist) {
      throw new BadRequestException('Phone Number exists');
    }

    const user = await this.prisma.user.create({
      data: { name, email, password, phone_number },
    });

    return { user, response };
  }

  // login service
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = { email, password };

    return user;
  }

  // get all users service
  async getUsers() {
    return this.prisma.user.findMany({});
  }
}
