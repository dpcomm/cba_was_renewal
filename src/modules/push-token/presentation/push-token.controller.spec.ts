import { Test, TestingModule } from '@nestjs/testing';
import { PushTokenController } from './push-token.controller';
import { RegisterPushTokenUseCase } from '../application/usecases/register-push-token.usecase';
import { DeletePushTokenUseCase } from '../application/usecases/delete-push-token.usecase';
import { PushToken } from '@modules/push-token/domain/entities/push-token.entity';

// ── Mock UseCases ───────────────────────────────────────────────
const mockRegisterPushTokenUseCase = {
  execute: jest.fn(),
};

const mockDeletePushTokenUseCase = {
  execute: jest.fn(),
};

// ── Tests ───────────────────────────────────────────────────────
describe('PushTokenController', () => {
  let controller: PushTokenController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushTokenController],
      providers: [
        {
          provide: RegisterPushTokenUseCase,
          useValue: mockRegisterPushTokenUseCase,
        },
        {
          provide: DeletePushTokenUseCase,
          useValue: mockDeletePushTokenUseCase,
        },
      ],
    }).compile();

    controller = module.get(PushTokenController);
  });

  describe('regist()', () => {
    it('푸시 토큰을 등록하고 결과를 반환해야 한다', async () => {
      const user = { id: 1, userId: 'test', rank: 'A' };
      const dto = { token: 'ExponentPushToken[123]' };

      const savedToken = new PushToken();
      savedToken.token = dto.token;
      savedToken.userId = user.id;

      mockRegisterPushTokenUseCase.execute.mockResolvedValue(savedToken);

      const result = await controller.regist(user, dto);

      expect(mockRegisterPushTokenUseCase.execute).toHaveBeenCalledWith(
        user.id,
        dto.token,
      );
      expect(result.data!.token).toBe(dto.token);
      expect(result.data!.userId).toBe(user.id);
    });
  });

  describe('delete()', () => {
    it('푸시 토큰을 삭제하고 결과를 반환해야 한다', async () => {
      const dto = { token: 'ExponentPushToken[123]' };

      mockDeletePushTokenUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.delete(dto);

      expect(mockDeletePushTokenUseCase.execute).toHaveBeenCalledWith(
        dto.token,
      );
      expect(result.data).toBeNull();
      expect(result.message).toContain('delete');
    });
  });
});
