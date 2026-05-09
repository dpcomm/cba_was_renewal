import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeletePushTokenUseCase } from './delete-push-token.usecase';
import { PushToken } from '@modules/push-token/domain/entities/push-token.entity';

// ── Mock Repositories ───────────────────────────────────────────
const mockPushTokenRepository = {
  delete: jest.fn(),
};

// ── Tests ───────────────────────────────────────────────────────
describe('DeletePushTokenUseCase', () => {
  let useCase: DeletePushTokenUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePushTokenUseCase,
        {
          provide: getRepositoryToken(PushToken),
          useValue: mockPushTokenRepository,
        },
      ],
    }).compile();

    useCase = module.get(DeletePushTokenUseCase);
  });

  it('주어진 토큰을 삭제해야 한다', async () => {
    mockPushTokenRepository.delete.mockResolvedValue({ affected: 1 });

    await useCase.execute('token-to-delete');

    expect(mockPushTokenRepository.delete).toHaveBeenCalledWith({
      token: 'token-to-delete',
    });
  });
});
