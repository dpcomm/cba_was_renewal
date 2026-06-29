import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SystemConfig } from '../../domain/entities/system-config.entity';
import { GetSystemConfigQuery } from './get-system-config.query';

describe('GetSystemConfigQuery', () => {
  let query: GetSystemConfigQuery;

  const systemConfigRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSystemConfigQuery,
        {
          provide: getRepositoryToken(SystemConfig),
          useValue: systemConfigRepository,
        },
      ],
    }).compile();

    query = module.get(GetSystemConfigQuery);
  });

  it('단일 시스템 설정과 현재 수련회 및 시즌 관계를 조회한다', async () => {
    const config = createSystemConfig();
    systemConfigRepository.findOne.mockResolvedValue(config);

    await expect(query.execute()).resolves.toBe(config);
    expect(systemConfigRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: {
        currentTerm: true,
        currentRetreat: true,
      },
    });
  });

  it('시스템 설정이 없으면 기본 단일 설정을 생성한다', async () => {
    const config = createSystemConfig();
    systemConfigRepository.findOne.mockResolvedValue(null);
    systemConfigRepository.create.mockReturnValue(config);
    systemConfigRepository.save.mockResolvedValue(config);

    await expect(query.execute()).resolves.toBe(config);
    expect(systemConfigRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        appName: 'CBA Connect',
        currentTermId: null,
        currentRetreatId: null,
      }),
    );
    expect(systemConfigRepository.save).toHaveBeenCalledWith(config);
  });
});

function createSystemConfig(): SystemConfig {
  const config = new SystemConfig();
  Object.assign(config, {
    id: 1,
    appName: 'CBA Connect',
    versionName: '1.0.0',
    versionCode: 1,
    minimumVersionCode: 1,
    privacyPolicyUrl: null,
    privacyPolicyVersion: 1,
    privacyPolicyUpdatedAt: null,
    maintenanceMode: false,
    maintenanceMessage: null,
    currentTermId: null,
    currentRetreatId: null,
    currentTerm: null,
    currentRetreat: null,
  });
  return config;
}
