import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RegisterPushTokenUseCase } from './register-push-token.usecase';
import { PushToken } from '@modules/push-token/domain/entities/push-token.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

// ── Mock Repositories ───────────────────────────────────────────
const mockPushTokenRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

// ── Helpers ─────────────────────────────────────────────────────
function createUser(id: number): User {
  const user = new User();
  user.id = id;
  return user;
}

function createPushToken(userId: number, token: string): PushToken {
  const pushToken = new PushToken();
  pushToken.token = token;
  pushToken.userId = userId;
  pushToken.user = createUser(userId);
  pushToken.provider = 'expo';
  return pushToken;
}

// ── Tests ───────────────────────────────────────────────────────
describe('RegisterPushTokenUseCase', () => {
  let useCase: RegisterPushTokenUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterPushTokenUseCase,
        {
          provide: getRepositoryToken(PushToken),
          useValue: mockPushTokenRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get(RegisterPushTokenUseCase);
  });

  it('존재하지 않는 사용자일 경우 NotFoundException을 던져야 한다', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(
      useCase.execute(999, 'ExponentPushToken[123]'),
    ).rejects.toThrow(new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND));
  });

  it('이미 등록된 토큰이고 같은 유저면 lastUsedAt만 갱신하고 저장해야 한다', async () => {
    const user = createUser(1);
    const existingToken = createPushToken(1, 'token123');
    const oldDate = new Date('2020-01-01');
    existingToken.lastUsedAt = oldDate;

    mockUserRepository.findOne.mockResolvedValue(user);
    mockPushTokenRepository.findOne.mockResolvedValue(existingToken);
    mockPushTokenRepository.save.mockImplementation((t) => Promise.resolve(t));

    const result = await useCase.execute(1, 'token123');

    expect(result.lastUsedAt!.getTime()).toBeGreaterThan(oldDate.getTime());
    expect(result.userId).toBe(1);
    expect(mockPushTokenRepository.save).toHaveBeenCalledWith(existingToken);
  });

  it('이미 등록된 토큰인데 다른 유저면 user를 교체하고 저장해야 한다', async () => {
    const newUser = createUser(2);
    const existingToken = createPushToken(1, 'token123'); // Originally belongs to user 1

    mockUserRepository.findOne.mockResolvedValue(newUser);
    mockPushTokenRepository.findOne.mockResolvedValue(existingToken);
    mockPushTokenRepository.save.mockImplementation((t) => Promise.resolve(t));

    const result = await useCase.execute(2, 'token123');

    expect(result.user.id).toBe(2);
    expect(mockPushTokenRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ user: newUser }),
    );
  });

  it('새로운 토큰이면 새로 생성하고 저장해야 한다', async () => {
    const user = createUser(1);
    const newToken = createPushToken(1, 'token-new');

    mockUserRepository.findOne.mockResolvedValue(user);
    mockPushTokenRepository.findOne.mockResolvedValue(null);
    mockPushTokenRepository.create.mockReturnValue(newToken);
    mockPushTokenRepository.save.mockImplementation((t) => Promise.resolve(t));

    const result = await useCase.execute(1, 'token-new');

    expect(mockPushTokenRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'token-new',
        provider: 'expo',
        user: user,
      }),
    );
    expect(mockPushTokenRepository.save).toHaveBeenCalledWith(newToken);
    expect(result.token).toBe('token-new');
  });
});
