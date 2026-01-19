import { ApiProperty } from '@nestjs/swagger';
import { UserGender } from '@modules/user/domain/enums/user-gender.enum';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  group: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ nullable: true })
  birth: Date;

  @ApiProperty({ enum: UserGender, nullable: true })
  gender: UserGender;

  @ApiProperty({ enum: UserRank })
  rank: UserRank;

  @ApiProperty({ nullable: true })
  email: string;

  @ApiProperty({ nullable: true })
  emailVerifiedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.userId = user.userId;
    this.name = user.name;
    this.group = user.group;
    this.phone = user.phone;
    this.birth = user.birth;
    this.gender = user.gender;
    this.rank = user.rank;
    this.email = user.email;
    this.emailVerifiedAt = user.emailVerifiedAt;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
