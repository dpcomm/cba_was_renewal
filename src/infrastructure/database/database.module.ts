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
        host: configService.get<string>('DOMAIN_LOCAL'),
        port: 3306,
        username: 'root',
        password: configService.get<string>('MYSQL_ROOT_PASSWORD'),
        database: configService.get<string>('MYSQL_DATABASE'),
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
