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
import { ok } from '@shared/responses/api-response';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CarpoolService } from '@modules/carpool/application/services/carpool.service';
import { 
    updateCarpoolRequestDto,
    createCarpoolRequestDto,
    updateCarpoolstatusRequestDto,
    participationCarpoolRequestDto, 
} from '@modules/carpool/application/dto/carpool.request.dto';
import { 
    CarpoolResponseDto,
    CarpoolListResponse,
    CarpoolSingleResponse, 
} from '../dto/carpool.response.dto';
import { CarpoolMapper } from '@modules/carpool/application/mappers/carpool.mapper';
import { CarpoolStatus } from '@modules/carpool/domain/carpool-status.enum';
import { get } from 'http';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';


@ApiTags('Carpool')
@Controller('carpool')
@JwtGuard()
export class CarpoolController {
    constructor(
        private readonly carpoolService: CarpoolService,
        private readonly mapper : CarpoolMapper,
    ) {}

    @Get()
    @ApiSuccessResponse({ type: CarpoolResponseDto, isArray: true })
    @ApiFailureResponse(404, ERROR_MESSAGES.CARPOOL_NOT_FOUND)
    async getAllCarpools() {
        const carpools = await this.carpoolService.getAllCarpoolRooms();
        return ok<CarpoolListResponse>(
            this.mapper.toResponseList(carpools),
            'Success get carpools'
        );
    }

    // Chat table이 없다고 뜸
    @Get(':id')
    @ApiSuccessResponse({ type: CarpoolResponseDto })
    @ApiFailureResponse(404, ERROR_MESSAGES.CARPOOL_NOT_FOUND)
    async getCarpoolById(
        @Param('id', ParseIntPipe) id: number
    ) {
        const carpool = await this.carpoolService.getCarpoolRoomById(id);
        return ok<CarpoolSingleResponse>(
            this.mapper.toResponse(carpool),
            'Success get carpool',
        );
    } 

    @Get('detail/:id')
    @ApiSuccessResponse({ type: CarpoolResponseDto })
    @ApiFailureResponse(404, ERROR_MESSAGES.CARPOOL_NOT_FOUND)
    async getCarpoolDetail(
        @Param('id', ParseIntPipe) id: number,
    ) {
        const carpool = await this.carpoolService.getCarpoolRoomDetail(id);
        return ok<CarpoolSingleResponse>(
            this.mapper.toResponse(carpool),
            'Success get carpool',
        );
    }

    @Get('my/:userId')
    @ApiSuccessResponse({ type: CarpoolResponseDto, isArray: true })
    @ApiFailureResponse(404, ERROR_MESSAGES.CARPOOL_NOT_FOUND)
    async findMyCarpools(
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        const carpools = await this.carpoolService.findMyCarpoolRooms(userId);
        return ok<CarpoolListResponse>(
            this.mapper.toResponseList(carpools),
            'Success get carpools'
        );
    }

    // updatedAt의 default 값이 없다는 이유로 실패중
    @Post()
    @ApiSuccessResponse({ type: CarpoolResponseDto }) 
    async createCarpool(
        @Body() dto: createCarpoolRequestDto
    ) {
        const carpool = await this.carpoolService.createCarpoolRoom(dto);
        return ok<CarpoolResponseDto>(
            this.mapper.toResponse(carpool),
            'Success create carpool',
        );
    }

    //
    // id parameter 삭제하고 싶음.
    @Post('update/:id')
    @ApiSuccessResponse({ type: CarpoolResponseDto })
    @ApiFailureResponse(404, ERROR_MESSAGES.CARPOOL_NOT_FOUND)
    async updateCarpool(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: updateCarpoolRequestDto
    ) {
        const carpool = await this.carpoolService.updateCarpoolRoom(dto);
        return ok<CarpoolResponseDto>(
            this.mapper.toResponse(carpool),
            'Success update carpool',
        );
    }

    @Post('join')
    @ApiSuccessResponse({ type: CarpoolResponseDto })
    @ApiFailureResponse(404, ERROR_MESSAGES.CARPOOL_NOT_FOUND)
    @ApiFailureResponse(409, ERROR_MESSAGES.CARPOOL_ALREADY_JOINED)
    @ApiFailureResponse(409, ERROR_MESSAGES.CARPOOL_NO_SEAT)
    async joinCarpool(
        @Body() dto: participationCarpoolRequestDto
    ) {
        const carpool = await this.carpoolService.joinCarpoolRoom(dto);
        return ok<CarpoolResponseDto>( 
            this.mapper.toResponse(carpool),
            'Success join carpool' 
        );
    }

    @Post('leave')
    @ApiSuccessResponse({ type: CarpoolResponseDto })
    @ApiFailureResponse(404, ERROR_MESSAGES.CARPOOL_NOT_FOUND)
    @ApiFailureResponse(409, ERROR_MESSAGES.CARPOOL_NOT_MEMBER)
    async leaveCarpool(
        @Body() dto: participationCarpoolRequestDto
    ) {
        const carpool = await this.carpoolService.leaveCarpoolRoom(dto);
        return ok<CarpoolResponseDto>( 
            this.mapper.toResponse(carpool),
            'Success leave carpool' 
        );
    }

    // 
    @Post('delete/:id')
    @ApiFailureResponse(404, ERROR_MESSAGES.CARPOOL_NOT_FOUND)
    async deleteCarpool(
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.carpoolService.deleteCarpoolRoom(id);
        return ok<null>( 
            null,  
            'Success delete carpool'
        );
    }

    //
    @Post('status')
    @ApiSuccessResponse({ type: CarpoolResponseDto })
    @ApiFailureResponse(404, ERROR_MESSAGES.CARPOOL_NOT_FOUND)
    async updateCarpoolStatus(
        @Body() dto: updateCarpoolstatusRequestDto
    ) {
        const carpool = await this.carpoolService.updateCarpoolStatus(dto);
        return ok<CarpoolResponseDto>(
            this.mapper.toResponse(carpool),
            'Success update status'
        )
    }

    @Post('start/:id')
    @ApiFailureResponse(404, ERROR_MESSAGES.CARPOOL_NOT_FOUND)
    async sendCarpoolStartNotification(
        @Param('id', ParseIntPipe) id: number,
    ) {
        // fcmservice의 send notification 동작 구현 후 작성 예정

    }

}
