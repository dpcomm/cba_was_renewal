import { ApiProperty } from '@nestjs/swagger';

export class VersionResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  versionName: string;

  @ApiProperty()
  versionCode: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  releaseDate: string;

  @ApiProperty()
  author: string;

  @ApiProperty({ type: [String] })
  updateNotes: string[];

  @ApiProperty()
  updateUrl: string;
}
