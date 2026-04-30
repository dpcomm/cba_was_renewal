import { Test, TestingModule } from '@nestjs/testing';
import { DeleteAccountUseCase } from './delete-account.usecase';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { GetUserQuery } from '../queries/get-user.query';
import { NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGES } from '../../../../shared/constants/error-messages';

describe('DeleteAccountUseCase', () => {
  let useCase: DeleteAccountUseCase;

  const mockUserRepository = {
    save: jest.fn((user) => user),
  };

  const mockGetUserQuery = {
    byId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAccountUseCase,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: GetUserQuery, useValue: mockGetUserQuery },
      ],
    }).compile();

    useCase = module.get<DeleteAccountUseCase>(DeleteAccountUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  it('should throw NotFoundException if user does not exist', async () => {
    mockGetUserQuery.byId.mockRejectedValueOnce(
      new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND),
    );

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
  });

  it('should soft delete user via entity.softDelete', async () => {
    const user = new User();
    Object.assign(user, { id: 1, name: 'User', isDeleted: false });
    mockGetUserQuery.byId.mockResolvedValueOnce(user);

    await useCase.execute(1);

    expect(user.isDeleted).toBe(true);
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
  });
});
