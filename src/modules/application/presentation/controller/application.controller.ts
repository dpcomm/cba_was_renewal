import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ok } from '@shared/responses/api-response';
import { ApiOkResponse, ApiOperation, ApiRequestTimeoutResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

import { ApplicationService } from '@modules/application/application/services/application.service';

@ApiTags('Application')
@Controller('application')
@JwtGuard()
export class ApplicationController {
    constructor(
        private readonly applicationService: ApplicationService,
    ) {}

    @Get('check/:userId/:retreatId')
    @ApiOperation({summary: '수련회 신청 여부 확인'})
    @ApiSuccessResponse({ })
    async checkApplication(
        @Param('userId') userId: string,
        @Param('retreatId', ParseIntPipe) retreatId: number,
    ) {
        const result = await this.applicationService.checkApplication(userId, retreatId);
        return ok<boolean>(
            result,
            'Success check application',
        );
    }

    @Get('check/paid/:userId/:retreatId')
    @ApiOperation({summary: '수련회 회비 납부 여부 확인'})
    @ApiSuccessResponse({ })
    @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
    async checkApplicationPaid(
        @Param('userId') userId: string,
        @Param('retreatId', ParseIntPipe) retreatId: number,
    ) {
        const result = await this.applicationService.checkApplicatinoPaid(userId, retreatId);
        return ok<boolean>(
            result,
            'Success check application paid',
        );
    }

    @Get(':userId')
    @ApiOperation({summary: '수련회 히스토리 조회'})
    @ApiSuccessResponse({ })
    async getApplicationsByUserId(
        @Param('userId') userId: string,
    ) {
        const retreatIds = await this.applicationService.getApplicationsByUserId(userId);
        return ok<number[]>(
            retreatIds,
            'Success get retreat id list',
        );
    }
}