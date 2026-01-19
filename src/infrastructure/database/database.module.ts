import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        url: configService.get<string>('DATABASE_URL'),
        entities: [
          join(__dirname, '..', '..', 'modules', '**', '*.entity{.ts,.js}'),
        ],
        synchronize: false,
        logging: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
