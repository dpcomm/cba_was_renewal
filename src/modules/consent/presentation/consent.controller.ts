import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { ConsentService } from '../application/services/consent.service';
import { CreateConsentDto } from '../application/dto/create-consent.dto';
import { ok } from '@shared/responses/api-response';
import {
  ConsentListResponse,
  ConsentResponseDto,
  ConsentSingleResponse,
} from './dto/consent.response.dto';
import { ConsentMapper } from '../application/mappers/consent.mapper';
import { ApiTags } from '@nestjs/swagger';
import { ConsentType } from '../domain/consent-type.enum';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '../../../shared/constants/error-messages';

@ApiTags('Consent')
@Controller('consent')
@JwtGuard()
export class ConsentController {
  constructor(
    private readonly consentService: ConsentService,
    private readonly mapper: ConsentMapper,
  ) {}

  @Get()
  @RankGuard(UserRank.ADMIN)
  @ApiSuccessResponse({ type: ConsentResponseDto, isArray: true })
  @ApiFailureResponse(404, ERROR_MESSAGES.CONSENT_NOT_FOUND)
  async getAll() {
    const consents = await this.consentService.findAll();
    return ok<ConsentListResponse>(
      this.mapper.toResponseList(consents),
      'Success fetch consents',
    );
  }

  @Get(':userId/:consentType')
  @ApiSuccessResponse({ type: ConsentResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.CONSENT_NOT_FOUND)
  async getOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('consentType', new ParseEnumPipe(ConsentType))
    consentType: ConsentType,
  ) {
    const consent = await this.consentService.findOne(userId, consentType);
    return ok<ConsentSingleResponse>(
      this.mapper.toResponse(consent),
      'Success fetch consent',
    );
  }

  @Post()
  @JwtGuard()
  @ApiSuccessResponse({ type: ConsentResponseDto })
  async create(@Body() dto: CreateConsentDto) {
    const consent = await this.consentService.create(dto);
    return ok<ConsentResponseDto>(
      this.mapper.toResponse(consent),
      'Success create consent',
    );
  }

  @Delete(':userId/:consentType')
  @JwtGuard()
  @ApiFailureResponse(404, ERROR_MESSAGES.CONSENT_NOT_FOUND)
  async remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('consentType', new ParseEnumPipe(ConsentType))
    consentType: ConsentType,
  ) {
    await this.consentService.remove(userId, consentType);
    return ok<null>(null, 'Success delete consent');
  }
}
