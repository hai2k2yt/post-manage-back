import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {SignInInput} from "./dto/signin.input";
import {verify} from "argon2";
import {JwtService} from "@nestjs/jwt";
import {AuthJwtPayload} from "./types/auth-jwtPayload";
import {User} from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {
  }

  async validateLocalUser({email, password}: SignInInput): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email
      }
    }) as User | null


    if (!user) throw new UnauthorizedException('User not found')

    const passwordMatched = await verify((user.password ?? ''), password)

    if (!passwordMatched) throw new UnauthorizedException('Invalid credentials')

    return user
  }

  async generateToken(userId: number) {
    const payload: AuthJwtPayload = {sub: userId}
    const accessToken = await this.jwtService.signAsync(payload)

    return {accessToken}
  }

  async login(user: User) {
    const {accessToken} = await this.generateToken(user.id)

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      accessToken
    }
  }

}
