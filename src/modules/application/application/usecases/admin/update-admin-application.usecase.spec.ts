import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { ApplicationMeal } from '@modules/application/domain/entities/application_meal.entity';
import { ApplicationTransport } from '@modules/application/domain/entities/application_transport.entity';
import {
  ApplicationStatus,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';
import { TransportDirection } from '@modules/retreat/domain/enum/retreat-transport.enum';
import { UpdateAdminApplicationUseCase } from './update-admin-application.usecase';

describe('UpdateAdminApplicationUseCase', () => {
  const manager = {
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    create: jest.fn((_entity, value) => value),
    save: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn((callback) => callback(manager)),
  };
  let useCase: UpdateAdminApplicationUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateAdminApplicationUseCase(
      dataSource as unknown as DataSource,
    );
  });

  it('수정할 필드가 없으면 BadRequestException을 던진다', async () => {
    await expect(useCase.execute(1, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('신청이 없으면 NotFoundException을 던진다', async () => {
    manager.findOne.mockResolvedValue(null);

    await expect(
      useCase.execute(1, { paymentStatus: PaymentStatus.PAID }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('다른 수련회의 식사 옵션을 거부한다', async () => {
    manager.findOne.mockResolvedValue({ id: 1, retreatId: 2 });
    manager.find.mockResolvedValue([{ id: 10, retreatId: 3 }]);

    await expect(
      useCase.execute(1, { retreatMealIds: [10] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('중복 식사 옵션을 거부한다', async () => {
    manager.findOne.mockResolvedValue({ id: 1, retreatId: 2 });

    await expect(
      useCase.execute(1, { retreatMealIds: [10, 10] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('다른 수련회의 교통 옵션을 거부한다', async () => {
    manager.findOne.mockResolvedValue({ id: 1, retreatId: 2 });
    manager.find.mockResolvedValue([
      { id: 10, retreatId: 3, direction: TransportDirection.DEPARTURE },
    ]);

    await expect(
      useCase.execute(1, { transports: [{ retreatTransportId: 10 }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('같은 방향의 교통 옵션을 두 개 선택하면 거부한다', async () => {
    manager.findOne.mockResolvedValue({ id: 1, retreatId: 2 });
    manager.find.mockResolvedValue([
      { id: 10, retreatId: 2, direction: TransportDirection.DEPARTURE },
      { id: 11, retreatId: 2, direction: TransportDirection.DEPARTURE },
    ]);

    await expect(
      useCase.execute(1, {
        transports: [{ retreatTransportId: 10 }, { retreatTransportId: 11 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('교통 옵션의 필수 차량번호를 검증한다', async () => {
    manager.findOne.mockResolvedValue({ id: 1, retreatId: 2 });
    manager.find.mockResolvedValue([
      {
        id: 10,
        retreatId: 2,
        direction: TransportDirection.DEPARTURE,
        isVehicleRequired: true,
        isRemarkRequired: false,
      },
    ]);

    await expect(
      useCase.execute(1, {
        transports: [{ retreatTransportId: 10, vehicleNumber: ' ' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('교통 옵션의 필수 비고를 검증한다', async () => {
    manager.findOne.mockResolvedValue({ id: 1, retreatId: 2 });
    manager.find.mockResolvedValue([
      {
        id: 10,
        retreatId: 2,
        direction: TransportDirection.RETURN,
        isVehicleRequired: false,
        isRemarkRequired: true,
      },
    ]);

    await expect(
      useCase.execute(1, {
        transports: [{ retreatTransportId: 10, remark: ' ' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('취소 신청의 체크인 변경을 거부한다', async () => {
    manager.findOne.mockResolvedValue({
      id: 1,
      retreatId: 2,
      status: ApplicationStatus.CANCELED,
    });

    await expect(
      useCase.execute(1, { checkedIn: true }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('여러 수정 항목을 하나의 트랜잭션에서 반영한다', async () => {
    const application = new Application();
    application.id = 1;
    application.retreatId = 2;
    application.status = ApplicationStatus.SUBMITTED;
    application.paymentStatus = PaymentStatus.PENDING;
    application.checkedInAt = null;
    manager.findOne.mockResolvedValue(application);
    manager.find
      .mockResolvedValueOnce([{ id: 20, retreatId: 2 }])
      .mockResolvedValueOnce([
        {
          id: 30,
          retreatId: 2,
          direction: TransportDirection.DEPARTURE,
          isVehicleRequired: false,
          isRemarkRequired: false,
        },
      ]);

    const result = await useCase.execute(1, {
      retreatMealIds: [20],
      transports: [{ retreatTransportId: 30, remark: '  탑승 예정 ' }],
      paymentStatus: PaymentStatus.PAID,
      checkedIn: true,
    });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(manager.delete).toHaveBeenCalledWith(ApplicationMeal, {
      applicationId: 1,
    });
    expect(manager.delete).toHaveBeenCalledWith(ApplicationTransport, {
      applicationId: 1,
    });
    expect(manager.save).toHaveBeenCalledWith(Application, application);
    expect(result).toEqual({
      retreatMealIds: [20],
      transports: [
        {
          retreatTransportId: 30,
          direction: TransportDirection.DEPARTURE,
          vehicleNumber: null,
          remark: '탑승 예정',
        },
      ],
      paymentStatus: PaymentStatus.PAID,
      applicationStatus: ApplicationStatus.CHECKED_IN,
      checkedInAt: expect.any(Date),
    });
  });

  it('빈 배열은 기존 식사와 교통 선택을 모두 해제한다', async () => {
    manager.findOne.mockResolvedValue({ id: 1, retreatId: 2 });

    await expect(
      useCase.execute(1, { retreatMealIds: [], transports: [] }),
    ).resolves.toEqual({
      retreatMealIds: [],
      transports: [],
      paymentStatus: undefined,
      applicationStatus: undefined,
      checkedInAt: undefined,
    });
    expect(manager.delete).toHaveBeenCalledTimes(2);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('이미 체크인된 신청에 true를 다시 보내도 체크인 시각을 유지한다', async () => {
    const checkedInAt = new Date('2026-04-20T09:15:00.000Z');
    const application = new Application();
    application.id = 1;
    application.retreatId = 2;
    application.status = ApplicationStatus.CHECKED_IN;
    application.checkedInAt = checkedInAt;
    manager.findOne.mockResolvedValue(application);

    await expect(useCase.execute(1, { checkedIn: true })).resolves.toEqual({
      retreatMealIds: undefined,
      transports: undefined,
      paymentStatus: undefined,
      applicationStatus: ApplicationStatus.CHECKED_IN,
      checkedInAt,
    });
  });
});
