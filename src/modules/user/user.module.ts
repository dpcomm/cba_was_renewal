import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { UserService } from './application/user.service';
import { UserController } from './presentation/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
