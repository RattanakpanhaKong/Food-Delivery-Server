import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();

    const accessToken = req.headers.accesstoken as string;
    const refreshToken = req.headers.refreshtoken as string;

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Please Login to Access');
    }

    if (accessToken) {
      const decoded = this.jwtService.verify(accessToken, {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
      });

      if (!decoded) {
        throw new UnauthorizedException('Invalid Access Token !');
      }

      await this.updateAccessToken(req);
    }
    return true;
  }

  private async updateAccessToken(req: any): Promise<void> {
    try {
      const refreshTokenData = req.headers.refreshtoken as string;
      const decoded = this.jwtService.verify(refreshTokenData, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
      });

      if (!decoded) {
        throw new UnauthorizedException('Invalid Refresh Token !');
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      // Generate new access token
      const accessToken = this.jwtService.sign(
        {
          id: user.id,
        },
        {
          secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: this.config.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
        },
      );
      const refreshToken = this.jwtService.sign(
        {
          id: user.id,
        },
        {
          secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
        },
      );

      req.accessToken = accessToken;
      req.refreshToken = refreshToken;
      req.user = user;
    } catch (error) {
      console.log('🚀 ~ AuthGuard ~ updateAccessToken ~ error:', error);
    }
  }
}
