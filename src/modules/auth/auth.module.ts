import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./application/auth.service";
import { UserModule } from "@modules/user/user.module";
import { LocalStrategy } from "./strategies/local.strategy";
import { AuthController } from "./presentation/auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RedisModule } from "../../infrastructure/database/redis.module";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule, 
    UserModule, 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default_secret',
        signOptions: { 
          issuer: configService.get<string>('JWT_ISSUER'),
          expiresIn: parseInt(configService.get<string>('JWT_EXPIRENTTIME') || '1600'),
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}