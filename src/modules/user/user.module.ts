import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './domain/entities/user.entity';
import { UserService } from './application/user.service';
import { UserController } from './presentation/user.controller';
import { UserAdminController } from './presentation/user-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({})],
  controllers: [UserController, UserAdminController],
  providers: [UserService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
