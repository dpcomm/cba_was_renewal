import { NotFoundException } from '@nestjs/common';
import { GetMyApplicationDetailQuery } from './get-my-application-detail.query';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';
import { Not, Repository } from 'typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';

describe('GetMyApplicationDetailQuery', () => {
  let query: GetMyApplicationDetailQuery;
  const repo = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    query = new GetMyApplicationDetailQuery(
      repo as unknown as Repository<Application>,
    );
    jest.clearAllMocks();
  });

  it('내 신청 상세를 식사, 교통, 답변 관계와 함께 조회한다', async () => {
    const application = { id: 1, userId: 'user1', retreatId: 2 };
    repo.findOne.mockResolvedValue(application);

    await expect(query.execute('user1', 2)).resolves.toEqual(application);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: {
        userId: 'user1',
        retreatId: 2,
        status: Not(ApplicationStatus.CANCELED),
      },
      relations: [
        'applicationMeals',
        'applicationMeals.retreatMeal',
        'applicationTransports',
        'applicationTransports.retreatTransport',
        'answers',
        'answers.question',
        'answers.questionOption',
      ],
    });
  });

  it('신청 row가 없으면 NotFoundException을 던진다', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(query.execute('user1', 2)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
