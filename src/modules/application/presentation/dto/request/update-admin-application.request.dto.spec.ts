import { PaymentStatus } from '@modules/application/domain/enum/application.enum';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateAdminApplicationRequestDto } from './update-admin-application.request.dto';

describe('UpdateAdminApplicationRequestDto', () => {
  it('탭별 필드와 통합 요청을 검증한다', async () => {
    const dto = plainToInstance(UpdateAdminApplicationRequestDto, {
      retreatMealIds: [1, 2],
      transports: [{ retreatTransportId: 3, remark: null }],
      paymentStatus: PaymentStatus.PAID,
      checkedIn: true,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each(['retreatMealIds', 'transports', 'paymentStatus', 'checkedIn'])(
    '%s에 null을 허용하지 않는다',
    async (field) => {
      const dto = plainToInstance(UpdateAdminApplicationRequestDto, {
        [field]: null,
      });

      const errors = await validate(dto);

      expect(errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ property: field })]),
      );
    },
  );

  it('중복 식사 ID와 잘못된 중첩 교통 ID를 거부한다', async () => {
    const dto = plainToInstance(UpdateAdminApplicationRequestDto, {
      retreatMealIds: [1, 1],
      transports: [{ retreatTransportId: 0 }],
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['retreatMealIds', 'transports']),
    );
  });
});
