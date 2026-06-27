import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertMyApplicationResponseDto {
  @ApiProperty({ example: 1 })
  applicationId: number;

  @ApiProperty({ example: 4 })
  retreatId: number;

  @ApiProperty({ example: 10 })
  surveyId: number;

  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.SUBMITTED,
  })
  status: ApplicationStatus;

  constructor(result: {
    applicationId: number;
    retreatId: number;
    surveyId: number;
    status: ApplicationStatus;
  }) {
    this.applicationId = result.applicationId;
    this.retreatId = result.retreatId;
    this.surveyId = result.surveyId;
    this.status = result.status;
  }
}
