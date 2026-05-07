import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushToken } from './domain/entities/push-token.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { PushTokenController } from './presentation/push-token.controller';
import { RegisterPushTokenUseCase } from './application/usecases/register-push-token.usecase';
import { DeletePushTokenUseCase } from './application/usecases/delete-push-token.usecase';
import { DeleteInvalidPushTokensUseCase } from './application/usecases/delete-invalid-push-tokens.usecase';
import { GetPushTokensQuery } from './application/queries/get-push-tokens.query';

@Module({
  imports: [TypeOrmModule.forFeature([PushToken, User])],
  controllers: [PushTokenController],
  providers: [
    RegisterPushTokenUseCase,
    DeletePushTokenUseCase,
    DeleteInvalidPushTokensUseCase,
    GetPushTokensQuery,
  ],
  exports: [
    RegisterPushTokenUseCase,
    DeletePushTokenUseCase,
    DeleteInvalidPushTokensUseCase,
    GetPushTokensQuery,
  ],
})
export class PushTokenModule {}
