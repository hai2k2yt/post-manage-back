import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, JwtFromRequestFunction, Strategy} from "passport-jwt";
import {ConfigService} from "@nestjs/config";
import {Injectable} from "@nestjs/common";
import {AuthJwtPayload} from "../types/auth-jwtPayload";
import {AuthService} from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false
    } as any);
  }

  validate(payload: AuthJwtPayload) {
    const userId = payload.sub

    return this.authService.validateJwtUser(userId)
  }
}