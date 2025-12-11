import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseBaseDto {
  @ApiProperty({ example: true, description: '성공 여부' })
  success: boolean;

  @ApiProperty({ example: 200, description: 'HTTP 상태 코드' })
  statusCode: number;

  @ApiProperty({ example: 'ok', description: '응답 메시지', required: false })
  message?: string;
}

export class ApiResponseDto<T> extends ApiResponseBaseDto {
  @ApiProperty({ description: '응답 데이터', required: false })
  data?: T;

  @ApiProperty({ description: '에러 정보', required: false })
  error?: any;
}
