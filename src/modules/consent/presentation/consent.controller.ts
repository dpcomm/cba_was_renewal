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
import { ConsentService } from '../application/services/consent.service';
import { CreateConsentDto } from '../application/dto/create-consent.dto';
import { ok } from '@shared/responses/api-response';
import {
  ConsentListResponse,
  ConsentResponseDto,
  ConsentSingleResponse,
} from './dto/consent.response.dto';
import { ConsentMapper } from '../application/mappers/consent.mapper';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ConsentType } from '../domain/consent-type.enum';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';

@ApiTags('Consent')
@Controller('consent')
@JwtGuard()
export class ConsentController {
  constructor(
    private readonly consentService: ConsentService,
    private readonly mapper: ConsentMapper,
  ) {}

  @Get()
  @ApiOkResponse({ type: ConsentResponseDto, isArray: true })
  async getAll() {
    const consents = await this.consentService.findAll();
    return ok<ConsentListResponse>(
      this.mapper.toResponseList(consents),
      'Success fetch consents',
    );
  }

  @Get(':userId/:consentType')
  @ApiOkResponse({ type: ConsentResponseDto })
  async getOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('consentType', new ParseEnumPipe(ConsentType))
    consentType: ConsentType,
  ) {
    const consent = await this.consentService.findOne(userId, consentType);
    return ok<ConsentSingleResponse>(
      this.mapper.toResponseOrNull(consent),
      consent ? 'Success fetch consent' : 'Consent not found',
    );
  }

  @Post()
  @ApiOkResponse({ type: ConsentResponseDto })
  async create(@Body() dto: CreateConsentDto) {
    const consent = await this.consentService.create(dto);
    return ok<ConsentResponseDto>(
      this.mapper.toResponse(consent),
      'Success create consent',
    );
  }

  @Delete(':userId/:consentType')
  async remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('consentType', new ParseEnumPipe(ConsentType))
    consentType: ConsentType,
  ) {
    await this.consentService.remove(userId, consentType);
    return ok<null>(null, 'Success delete consent');
  }
}
