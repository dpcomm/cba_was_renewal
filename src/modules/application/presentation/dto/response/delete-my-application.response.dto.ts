import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';

export class DeleteMyApplicationResponseDto {
  @ApiProperty({ example: 1 })
  applicationId: number;

  @ApiProperty({ example: 4 })
  retreatId: number;

  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.CANCELED,
  })
  status: ApplicationStatus.CANCELED;

  @ApiProperty({ example: true })
  canceled: true;

  constructor(result: {
    applicationId: number;
    retreatId: number;
    status: ApplicationStatus.CANCELED;
    canceled: true;
  }) {
    this.applicationId = result.applicationId;
    this.retreatId = result.retreatId;
    this.status = result.status;
    this.canceled = result.canceled;
  }
}
