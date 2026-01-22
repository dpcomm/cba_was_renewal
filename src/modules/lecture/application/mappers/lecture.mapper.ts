import { Injectable } from '@nestjs/common';
import { Lecture } from '@modules/lecture/domain/entities/lecture.entity';
import {
  LectureResponseDto,
  LectureListResponse,
  LectureSingleResponse,
} from '@modules/lecture/presentation/dto/lecture.response.dto';

@Injectable()
export class LectureMapper {
  toResponse(lecture: Lecture): LectureResponseDto {
    return {
      id: lecture.id,
      title: lecture.title,
      instructorName: lecture.instructor,
      instructorBio: lecture.instructorBio,
      location: lecture.location,
      startTime: lecture.startTime.toISOString(),
      currentCount: lecture.currentCount,
      maxCapacity: lecture.maxCapacity,
      termName: lecture.term.name,
      codeNumber: lecture.codeNumber,
      introduction: lecture.introduction,
    };
  }

  toResponseList(lectures: Lecture[]): LectureListResponse {
    return lectures.map((lecture) => this.toResponse(lecture));
  }

  toResponseOrNull(lecture: Lecture | null): LectureSingleResponse {
    return lecture ? this.toResponse(lecture) : null;
  }
}
