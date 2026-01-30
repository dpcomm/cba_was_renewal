import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        url: configService.get<string>('DATABASE_URL'),
        entities: [__dirname + '/../../modules/**/domain/entities/*.entity.js'],
        synchronize: true,
        logging: ['prod', 'production'].includes(
          configService.get<string>('NODE_ENV') || 'dev',
        )
          ? ['error', 'warn']
          : true,
      }),
    }),
  ],
})
export class DatabaseModule {}
