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
        host: configService.get<string>('MYSQL_HOST'),
        port: parseInt(configService.get<string>('MYSQL_PORT') || '3306'),
        username: configService.get<string>('MYSQL_USER'),
        password: configService.get<string>('MYSQL_PASSWORD'),
        database: configService.get<string>('MYSQL_DATABASE'),
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
