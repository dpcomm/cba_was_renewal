import { Test, TestingModule } from '@nestjs/testing';
import { AdminUpdateUserUseCase } from './admin-update-user.usecase';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { GetUserQuery } from '../queries/get-user.query';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ERROR_MESSAGES } from '../../../../shared/constants/error-messages';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
}));

describe('AdminUpdateUserUseCase', () => {
  let useCase: AdminUpdateUserUseCase;

  const mockUserRepository = {
    save: jest.fn((user) => user),
  };

  const mockGetUserQuery = {
    byId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUpdateUserUseCase,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: GetUserQuery, useValue: mockGetUserQuery },
      ],
    }).compile();

    useCase = module.get<AdminUpdateUserUseCase>(AdminUpdateUserUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  it('should throw NotFoundException if user does not exist', async () => {
    mockGetUserQuery.byId.mockRejectedValueOnce(
      new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND),
    );

    await expect(useCase.execute(999, { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update profile fields via entity domain method', async () => {
    const user = new User();
    Object.assign(user, { id: 1, name: 'Old', group: 'A', rank: 'M' });
    mockGetUserQuery.byId.mockResolvedValueOnce(user);

    const result = await useCase.execute(1, { name: 'New', group: 'B' });

    expect(result.name).toBe('New');
    expect(result.group).toBe('B');
  });

  it('should hash password via entity.changePassword', async () => {
    const user = new User();
    Object.assign(user, { id: 1, name: 'User', password: 'old' });
    mockGetUserQuery.byId.mockResolvedValueOnce(user);

    const result = await useCase.execute(1, { password: 'newPassword' });

    expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    expect(result.password).toBe('hashedPassword123');
  });

  it('should change rank via entity.changeRank', async () => {
    const user = new User();
    Object.assign(user, { id: 1, name: 'User', rank: 'M' });
    mockGetUserQuery.byId.mockResolvedValueOnce(user);

    const result = await useCase.execute(1, { rank: 'A' });

    expect(result.rank).toBe('A');
  });

  it('should reset emailVerifiedAt when email changes via entity.changeEmail', async () => {
    const user = new User();
    Object.assign(user, {
      id: 1,
      email: 'old@example.com',
      emailVerifiedAt: new Date(),
    });
    mockGetUserQuery.byId.mockResolvedValueOnce(user);

    const result = await useCase.execute(1, { email: 'new@example.com' });

    expect(result.email).toBe('new@example.com');
    expect(result.emailVerifiedAt).toBeNull();
  });

  it('should not reset emailVerifiedAt if email is unchanged', async () => {
    const verifiedDate = new Date();
    const user = new User();
    Object.assign(user, {
      id: 1,
      email: 'same@example.com',
      emailVerifiedAt: verifiedDate,
    });
    mockGetUserQuery.byId.mockResolvedValueOnce(user);

    const result = await useCase.execute(1, {
      email: 'same@example.com',
      name: 'Changed',
    });

    expect(result.email).toBe('same@example.com');
    expect(result.emailVerifiedAt).toBe(verifiedDate);
    expect(result.name).toBe('Changed');
  });
});
