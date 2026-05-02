import { Test, TestingModule } from '@nestjs/testing';
import { PushTokenService } from './push-token.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PushToken } from '@modules/push-token/domain/entities/push-token.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

describe('PushTokenService', () => {
  let service: PushTokenService;

  const mockPushTokenRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushTokenService,
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

    service = module.get<PushTokenService>(PushTokenService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registToken', () => {
    it('유저가 존재하지 않으면 NotFoundException을 던져야 한다', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.registToken(999, 'token_123')).rejects.toThrow(
        new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND),
      );
    });

    it('이미 존재하는 토큰이면 유저 정보를 갱신하고 lastUsedAt을 업데이트해야 한다', async () => {
      const mockUser = { id: 2, name: 'User 2' } as User;
      const mockExistingToken = {
        token: 'token_123',
        userId: 1,
        user: { id: 1 },
        lastUsedAt: new Date('2020-01-01'),
      } as PushToken;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPushTokenRepository.findOne.mockResolvedValue(mockExistingToken);
      mockPushTokenRepository.save.mockImplementation((t) => t);

      const result = await service.registToken(2, 'token_123');

      expect(result.user.id).toBe(2);
      expect(result.lastUsedAt!.getTime()).toBeGreaterThan(
        new Date('2020-01-01').getTime(),
      );
      expect(mockPushTokenRepository.save).toHaveBeenCalledWith(
        mockExistingToken,
      );
    });

    it('존재하지 않는 토큰이면 새로 생성하여 저장해야 한다', async () => {
      const mockUser = { id: 1, name: 'User 1' } as User;
      const mockNewToken = {
        token: 'new_token',
        provider: 'expo',
        user: mockUser,
        lastUsedAt: expect.any(Date),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPushTokenRepository.findOne.mockResolvedValue(null);
      mockPushTokenRepository.create.mockReturnValue(mockNewToken);
      mockPushTokenRepository.save.mockResolvedValue(mockNewToken);

      const result = await service.registToken(1, 'new_token');

      expect(mockPushTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'new_token',
          user: mockUser,
        }),
      );
      expect(result.token).toBe('new_token');
    });
  });

  describe('deleteToken', () => {
    it('주어진 토큰을 삭제해야 한다', async () => {
      mockPushTokenRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteToken('target_token');

      expect(mockPushTokenRepository.delete).toHaveBeenCalledWith({
        token: 'target_token',
      });
    });
  });

  describe('getTokens', () => {
    it('userIds가 주어지지 않으면 전체 토큰을 반환해야 한다', async () => {
      const mockTokens = [{ token: 't1' }, { token: 't2' }];
      mockPushTokenRepository.find.mockResolvedValue(mockTokens);

      const result = await service.getTokens();

      expect(result).toEqual(mockTokens);
      expect(mockPushTokenRepository.find).toHaveBeenCalledWith();
    });

    it('빈 배열이 주어지면 빈 배열을 반환해야 한다', async () => {
      const result = await service.getTokens([]);

      expect(result).toEqual([]);
      expect(mockPushTokenRepository.find).not.toHaveBeenCalled();
    });

    it('단일 userId가 주어지면 배열로 변환하여 검색해야 한다', async () => {
      mockPushTokenRepository.find.mockResolvedValue([{ token: 't1' }]);

      await service.getTokens(1);

      expect(mockPushTokenRepository.find).toHaveBeenCalledWith({
        where: { userId: expect.anything() },
      });
    });

    it('userIds 배열이 주어지면 해당 조건으로 검색해야 한다', async () => {
      mockPushTokenRepository.find.mockResolvedValue([{ token: 't1' }]);

      await service.getTokens([1, 2, 3]);

      expect(mockPushTokenRepository.find).toHaveBeenCalledWith({
        where: { userId: expect.anything() },
      });
    });
  });

  describe('deleteInvalidTokens', () => {
    it('빈 배열이 주어지면 아무 동작도 하지 않아야 한다', async () => {
      await service.deleteInvalidTokens([]);
      expect(mockPushTokenRepository.delete).not.toHaveBeenCalled();
    });

    it('토큰 배열이 주어지면 일괄 삭제를 수행해야 한다', async () => {
      const tokens = ['t1', 't2'];
      await service.deleteInvalidTokens(tokens);

      expect(mockPushTokenRepository.delete).toHaveBeenCalledWith([
        { token: 't1' },
        { token: 't2' },
      ]);
    });
  });
});
