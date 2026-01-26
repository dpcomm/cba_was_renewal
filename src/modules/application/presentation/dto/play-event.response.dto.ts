import { ApiProperty } from '@nestjs/swagger';
import { EventResult } from '@modules/application/domain/enum/application.enum';

export class PlayEventResponseDto {
  @ApiProperty({
    description: '이벤트 결과',
    enum: EventResult,
    example: EventResult.WIN,
  })
  eventResult: EventResult;
}
