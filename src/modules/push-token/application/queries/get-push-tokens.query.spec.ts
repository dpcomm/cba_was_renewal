import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GetPushTokensQuery } from './get-push-tokens.query';
import { PushToken } from '@modules/push-token/domain/entities/push-token.entity';
import { In } from 'typeorm';

// ── Mock Repositories ───────────────────────────────────────────
const mockPushTokenRepository = {
  find: jest.fn(),
};

// ── Tests ───────────────────────────────────────────────────────
describe('GetPushTokensQuery', () => {
  let query: GetPushTokensQuery;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPushTokensQuery,
        {
          provide: getRepositoryToken(PushToken),
          useValue: mockPushTokenRepository,
        },
      ],
    }).compile();

    query = module.get(GetPushTokensQuery);
  });

  it('userIds가 주어지지 않으면 전체 토큰을 반환해야 한다', async () => {
    const tokens = [{ token: 't1' }, { token: 't2' }];
    mockPushTokenRepository.find.mockResolvedValue(tokens);

    const result = await query.execute();

    expect(mockPushTokenRepository.find).toHaveBeenCalledWith();
    expect(result).toEqual(tokens);
  });

  it('단일 userId가 주어지면 해당 유저의 토큰을 반환해야 한다', async () => {
    const tokens = [{ token: 't1' }];
    mockPushTokenRepository.find.mockResolvedValue(tokens);

    const result = await query.execute(1);

    expect(mockPushTokenRepository.find).toHaveBeenCalledWith({
      where: { userId: In([1]) },
    });
    expect(result).toEqual(tokens);
  });

  it('userId 배열이 주어지면 해당 유저들의 토큰을 반환해야 한다', async () => {
    const tokens = [{ token: 't1' }, { token: 't2' }];
    mockPushTokenRepository.find.mockResolvedValue(tokens);

    const result = await query.execute([1, 2]);

    expect(mockPushTokenRepository.find).toHaveBeenCalledWith({
      where: { userId: In([1, 2]) },
    });
    expect(result).toEqual(tokens);
  });

  it('빈 배열이 주어지면 빈 배열을 즉시 반환해야 한다', async () => {
    const result = await query.execute([]);

    expect(mockPushTokenRepository.find).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
