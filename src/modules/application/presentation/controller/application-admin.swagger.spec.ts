import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApplicationAdminController } from './application-admin.controller';
import { ScanApplicationQuery } from '@modules/application/application/queries/admin/scan-application.query';
import { GetAdminApplicationListQuery } from '@modules/application/application/queries/admin/get-admin-application-list.query';
import { GetAdminApplicationDetailQuery } from '@modules/application/application/queries/admin/get-admin-application-detail.query';
import { CheckInApplicationUseCase } from '@modules/application/application/usecases/admin/check-in-application.usecase';
import { UpdateAdminApplicationUseCase } from '@modules/application/application/usecases/admin/update-admin-application.usecase';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { RanksGuard } from '@shared/guards/ranks.guard';

describe('ApplicationAdminController Swagger', () => {
  let app: INestApplication;
  const updateUseCase = { execute: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ApplicationAdminController],
      providers: [
        ScanApplicationQuery,
        GetAdminApplicationListQuery,
        GetAdminApplicationDetailQuery,
        CheckInApplicationUseCase,
        UpdateAdminApplicationUseCase,
      ],
    })
      .overrideProvider(ScanApplicationQuery)
      .useValue({ execute: jest.fn() })
      .overrideProvider(GetAdminApplicationListQuery)
      .useValue({ execute: jest.fn() })
      .overrideProvider(GetAdminApplicationDetailQuery)
      .useValue({ execute: jest.fn() })
      .overrideProvider(CheckInApplicationUseCase)
      .useValue({ execute: jest.fn() })
      .overrideProvider(UpdateAdminApplicationUseCase)
      .useValue(updateUseCase)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RanksGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
  });

  afterAll(async () => {
    await app.close();
  });

  it('통합 수정 endpoint와 탭별 요청 예시를 OpenAPI에 노출한다', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().addBearerAuth().build(),
    );
    const operation =
      document.paths['/admin/applications/{applicationId}']?.patch;

    expect(operation).toBeDefined();
    expect(operation?.security).toEqual([{ bearer: [] }]);
    expect(operation?.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'applicationId',
          in: 'path',
          required: true,
        }),
      ]),
    );

    const requestBody = operation?.requestBody as {
      content?: Record<
        string,
        {
          schema?: { $ref?: string };
          examples?: Record<string, unknown>;
        }
      >;
    };
    const jsonBody = requestBody.content?.['application/json'];

    expect(jsonBody?.schema?.$ref).toContain(
      'UpdateAdminApplicationRequestDto',
    );
    expect(Object.keys(jsonBody?.examples ?? {})).toEqual(
      expect.arrayContaining([
        'meals',
        'transports',
        'payment',
        'checkIn',
        'combined',
        'clearSelections',
      ]),
    );
    expect(operation?.responses).toEqual(
      expect.objectContaining({
        '200': expect.any(Object),
        '400': expect.any(Object),
        '404': expect.any(Object),
        '409': expect.any(Object),
      }),
    );
    expect(operation?.responses['400']?.description).toContain(
      'At least one application update is required',
    );
    expect(operation?.responses['400']?.description).toContain(
      'Invalid application transport selection',
    );
  });
});
