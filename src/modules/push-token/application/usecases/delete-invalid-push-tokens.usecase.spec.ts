import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteInvalidPushTokensUseCase } from './delete-invalid-push-tokens.usecase';
import { PushToken } from '@modules/push-token/domain/entities/push-token.entity';

// ── Mock Repositories ───────────────────────────────────────────
const mockPushTokenRepository = {
  delete: jest.fn(),
};

// ── Tests ───────────────────────────────────────────────────────
describe('DeleteInvalidPushTokensUseCase', () => {
  let useCase: DeleteInvalidPushTokensUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteInvalidPushTokensUseCase,
        {
          provide: getRepositoryToken(PushToken),
          useValue: mockPushTokenRepository,
        },
      ],
    }).compile();

    useCase = module.get(DeleteInvalidPushTokensUseCase);
  });

  it('토큰 목록이 주어지면 매핑하여 삭제해야 한다', async () => {
    mockPushTokenRepository.delete.mockResolvedValue({ affected: 2 });

    await useCase.execute(['token1', 'token2']);

    expect(mockPushTokenRepository.delete).toHaveBeenCalledWith([
      { token: 'token1' },
      { token: 'token2' },
    ]);
  });

  it('빈 배열이나 null이 주어지면 아무 동작도 하지 않아야 한다', async () => {
    await useCase.execute([]);
    expect(mockPushTokenRepository.delete).not.toHaveBeenCalled();

    await useCase.execute(null as any);
    expect(mockPushTokenRepository.delete).not.toHaveBeenCalled();
  });
});
