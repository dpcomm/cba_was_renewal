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
        host: configService.get<string>('DOMAIN_LOCAL'), // Or DOMAIN_PRODUCTION based on env
        port: 3306,
        username: 'root', // Assuming root from connection string, or parse DATABASE_URL
        password: configService.get<string>('MYSQL_ROOT_PASSWORD'),
        database: configService.get<string>('MYSQL_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // Important: set to false to avoid altering existing schema
        logging: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
