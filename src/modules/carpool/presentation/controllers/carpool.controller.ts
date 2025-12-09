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


@ApiTags('Carpool')
@Controller('carpool')
export class CarpoolController {
    constructor(
        private readonly carpoolService: CarpoolService,
        private readonly mapper : CarpoolMapper,
    ) {}

    @Get()
    @ApiOkResponse({ type: CarpoolResponseDto, isArray: true })
    async getAllCarpools() {
        const carpools = await this.carpoolService.getAllCarpoolRooms();
        return ok<CarpoolListResponse>(
            this.mapper.toResponseList(carpools),
            'Success'
        );
    }

    // Chat table이 없다고 뜸
    @Get(':id')
    @ApiOkResponse({ type: CarpoolResponseDto })
    async getCarpoolById(
        @Param('id', ParseIntPipe) id: number
    ) {
        const carpool = await this.carpoolService.getCarpoolRoomById(id);
        return ok<CarpoolSingleResponse>(
            this.mapper.toResponseOrNull(carpool),
            carpool ? 'Success' : 'Carpool not found'
        );
    } 

    @Get('detail/:id')
    @ApiOkResponse({ type: CarpoolResponseDto })
    async getCarpoolDetail(
        @Param('id', ParseIntPipe) id: number,
    ) {
        const carpool = await this.carpoolService.getCarpoolRoomDetail(id);
        return ok<CarpoolSingleResponse>(
            this.mapper.toResponseOrNull(carpool),
            carpool ? 'Success' : 'Carpool not found'
        );
    }

    @Get('my/:userId')
    @ApiOkResponse({ type: CarpoolResponseDto, isArray: true })
    async findMyCarpools(
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        const carpools = await this.carpoolService.findMyCarpoolRooms(userId);
        return ok<CarpoolListResponse>(
            this.mapper.toResponseList(carpools),
            'Success'
        );
    }

    // updatedAt의 default 값이 없다는 이유로 실패중
    @Post()
    @ApiOkResponse({ type: CarpoolResponseDto }) 
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
    @ApiOkResponse({ type: CarpoolResponseDto })
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
    @ApiOkResponse({ type: Boolean })
    async joinCarpool(
        @Body() dto: participationCarpoolRequestDto
    ) {
        const result = await this.carpoolService.joinCarpoolRoom(dto);
        return ok<Boolean>( 
            result,
            'Success join carpool' 
        );
    }

    @Post('leave')
    @ApiOkResponse({ type: Boolean })
    async leaveCarpool(
        @Body() dto: participationCarpoolRequestDto
    ) {
        const result = await this.carpoolService.leaveCarpoolRoom(dto);
        return ok<Boolean>( 
            result,
            'Success leave carpool' 
        );
    }

    // 
    @Post('delete/:id')
    @ApiOkResponse({ type: Boolean })
    async deleteCarpool(
        @Param('id', ParseIntPipe) id: number,
    ) {
        const result = await this.carpoolService.deleteCarpoolRoom(id);
        return ok<Boolean>( 
            result,  
            'Success delete carpool'
        );
    }

    //
    @Post('status')
    @ApiOkResponse({ type: CarpoolResponseDto })
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
    @ApiOkResponse({ type: Boolean })
    async sendCarpoolStartNotification(
        @Param('id', ParseIntPipe) id: number,
    ) {
        // fcmservice의 send notification 동작 구현 후 작성 예정

    }

}
