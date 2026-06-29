import { Survey } from '@modules/application/domain/entities/survey.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { RetreatMapper } from './retreat.mapper';

describe('RetreatMapper', () => {
  const mapper = new RetreatMapper();

  it('maps retreat address and representative survey period', () => {
    const retreat = createRetreat([
      createSurvey(12, '2026-07-04T00:00:00.000Z', '2026-07-07T23:59:59.000Z'),
      createSurvey(10, '2026-07-02T00:00:00.000Z', '2026-07-05T23:59:59.000Z'),
    ]);

    const result = mapper.toResponse(retreat);

    expect(result).toMatchObject({
      id: 1,
      title: '2026 여름 수련회',
      location: '수련원',
      address: '경기도 안산시',
      retreatStartAt: '2026-08-21T00:00:00.000Z',
      retreatEndAt: '2026-08-23T00:00:00.000Z',
      surveyId: 10,
      surveyStartAt: '2026-07-02T00:00:00.000Z',
      surveyEndAt: '2026-07-05T23:59:59.000Z',
    });
  });

  it('maps null survey fields when no survey exists', () => {
    const result = mapper.toResponse(createRetreat([]));

    expect(result.surveyId).toBeNull();
    expect(result.surveyStartAt).toBeNull();
    expect(result.surveyEndAt).toBeNull();
  });
});

function createRetreat(surveys: Survey[]): Retreat {
  return Object.assign(new Retreat(), {
    id: 1,
    title: '2026 여름 수련회',
    location: '수련원',
    address: '경기도 안산시',
    retreatStartAt: new Date('2026-08-21T00:00:00.000Z'),
    retreatEndAt: new Date('2026-08-23T00:00:00.000Z'),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    surveys,
  });
}

function createSurvey(id: number, startAt: string, endAt: string): Survey {
  return Object.assign(new Survey(), {
    id,
    surveyStartAt: new Date(startAt),
    surveyEndAt: new Date(endAt),
  });
}
