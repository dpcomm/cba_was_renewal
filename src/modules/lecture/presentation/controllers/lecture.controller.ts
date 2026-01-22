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
import {
  ApiOkResponse,
  ApiOperation,
  ApiRequestTimeoutResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

import { User } from '@shared/decorators/user.decorator';
import { User as UserEntity } from '@modules/user/domain/entities/user.entity';

import { LectureService } from '@modules/lecture/application/services/lecture.service';
import { LectureMapper } from '@modules/lecture/application/mappers/lecture.mapper';
import {
  createLectureRequestDto,
  updateLectureRequestDto,
  enrollLectureRequestDto,
  dropLectureRequestDto,
} from '@modules/lecture/application/dto/lecture.request.dto';
import {
  LectureResponseDto,
  LectureListResponse,
  LectureSingleResponse,
  LectureDetailResponseDto,
  LectureDetailListResponse,
  LectureDetailSingleResponse,
} from '../dto/lecture.response.dto';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';

@ApiTags('Lecture')
@Controller('lecture')
@JwtGuard()
export class LectureController {
  constructor(
    private readonly lectureService: LectureService,
    private readonly mapper: LectureMapper,
  ) {}

  // 내가 신청한 강의 목록 조회
  @Get('me')
  @ApiOperation({ summary: '내가 신청한 강의 목록 조회' })
  @ApiSuccessResponse({ type: LectureResponseDto, isArray: true })
  async getMyLectures(@User() user: UserEntity) {
    const lectures = await this.lectureService.getMyLectures(user.id);
    return ok<LectureListResponse>(
      this.mapper.toResponseList(lectures),
      'Success get my lectures',
    );
  }

  // 강의 목록 조회

  // 강의 조회
  // id를 통해 강의에 대한 정보 조회
  @Get(':id')
  @ApiOperation({ summary: '강의 조회' })
  @ApiSuccessResponse({ type: LectureResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.LECTURE_NOT_FOUND)
  async getLectureById(@Param('id', ParseIntPipe) id: number) {
    const lecture = await this.lectureService.getLectureById(id);
    return ok<LectureSingleResponse>(
      this.mapper.toResponse(lecture),
      'Success get lecture',
    );
  }

  // 강의 상세 조회
  // id를 통해 해당 강의의 참여자를 포함하여 조회
  @Get('detail/:id')
  @ApiOperation({ summary: '강의 상세 조회(수강자 포함)' })
  @ApiSuccessResponse({ type: LectureDetailResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.LECTURE_NOT_FOUND)
  async getLectureDetailById(@Param('id', ParseIntPipe) id: number) {
    const lectureDetail = await this.lectureService.getLectureDetailById(id);
    return ok<LectureDetailSingleResponse>(
      lectureDetail,
      'Success get lecture detail',
    );
  }

  // 강의 생성
  @Post()
  @RankGuard(UserRank.ADMIN)
  @ApiOperation({ summary: '강의 생성' })
  @ApiSuccessResponse({ type: LectureResponseDto })
  async createLecture(@Body() dto: createLectureRequestDto) {
    const lecture = await this.lectureService.createLecture(dto);
    return ok<LectureResponseDto>(
      this.mapper.toResponse(lecture),
      'Success create lecture',
    );
  }

  // 강의 수정
  @Post('update')
  @RankGuard(UserRank.ADMIN)
  @ApiOperation({ summary: '강의 수정' })
  @ApiSuccessResponse({ type: LectureResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.LECTURE_NOT_FOUND)
  async updateLecture(@Body() dto: updateLectureRequestDto) {
    const lecture = await this.lectureService.updateLecture(dto);
    return ok<LectureResponseDto>(
      this.mapper.toResponse(lecture),
      'Success update lecture',
    );
  }

  // 강의 삭제
  @Delete(':id')
  @RankGuard(UserRank.ADMIN)
  @ApiOperation({ summary: '강의 삭제' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(404, ERROR_MESSAGES.LECTURE_NOT_FOUND)
  async deleteLecture(@Param('id', ParseIntPipe) id: number) {
    await this.lectureService.deleteLecture(id);
    return ok<null>(null, 'Success delete lecture');
  }

  // 강의 수강 신청
  @Post('enroll')
  @ApiOperation({ summary: '수강 신청' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(400, ERROR_MESSAGES.ALREADY_ENROLLED)
  @ApiFailureResponse(400, ERROR_MESSAGES.LECTURE_FULL)
  @ApiFailureResponse(404, ERROR_MESSAGES.LECTURE_NOT_FOUND)
  async enrollLecture(@Body() dto: enrollLectureRequestDto) {
    await this.lectureService.enrollLecture(dto);
    return ok<null>(null, 'Success enroll lecture');
  }

  // 강의 수강 취소
  @Post('drop')
  @ApiOperation({ summary: '수강 취소' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(404, ERROR_MESSAGES.ENROLLMENT_NOT_FOUND)
  async dropLecture(@Body() dto: dropLectureRequestDto) {
    await this.lectureService.dropLecture(dto);
    return ok<null>(null, 'Success drop lecture');
  }
}
