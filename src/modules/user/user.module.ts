import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './domain/entities/user.entity';
import { UserController } from './presentation/user.controller';
import { UserAdminController } from './presentation/user-admin.controller';

// Queries
import { GetUserQuery } from './application/queries/get-user.query';
import { SearchUsersQuery } from './application/queries/search-users.query';
import { GetAdminUsersQuery } from './application/queries/get-admin-users.query';

// UseCases
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { UpdateUserProfileUseCase } from './application/usecases/update-user-profile.usecase';
import { UpdateUserEmailUseCase } from './application/usecases/update-user-email.usecase';
import { DeleteAccountUseCase } from './application/usecases/delete-account.usecase';
import { AdminUpdateUserUseCase } from './application/usecases/admin-update-user.usecase';

const queries = [GetUserQuery, SearchUsersQuery, GetAdminUsersQuery];

const useCases = [
  CreateUserUseCase,
  UpdateUserProfileUseCase,
  UpdateUserEmailUseCase,
  DeleteAccountUseCase,
  AdminUpdateUserUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({})],
  controllers: [UserController, UserAdminController],
  providers: [...queries, ...useCases],
  exports: [
    TypeOrmModule,
    // 외부 모듈(Auth 등)에서 사용하는 것만 export
    GetUserQuery,
    SearchUsersQuery,
    CreateUserUseCase,
    UpdateUserProfileUseCase,
  ],
})
export class UserModule {}
