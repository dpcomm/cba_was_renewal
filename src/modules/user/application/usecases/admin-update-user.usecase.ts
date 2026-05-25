import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { GetUserQuery } from '../queries/get-user.query';
import * as bcrypt from 'bcryptjs';
import { UserGroup } from '../../domain/enums/user-group.enum';

@Injectable()
export class AdminUpdateUserUseCase {
  private readonly logger = new Logger(AdminUpdateUserUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly getUserQuery: GetUserQuery,
  ) {}

  async execute(
    userId: number,
    dto: {
      name?: string;
      group?: UserGroup;
      phone?: string;
      birth?: string;
      gender?: string;
      rank?: string;
      email?: string;
      password?: string;
    },
  ): Promise<User> {
    const user = await this.getUserQuery.byId(userId);

    // 비밀번호 초기화
    if (dto.password) {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      user.changePassword(hashedPassword);
    }

    // 등급 변경
    if (dto.rank) {
      user.changeRank(dto.rank);
    }

    // 이메일 직접 변경 (인증 절차 생략, 인증 상태 초기화)
    if (dto.email && dto.email !== user.email) {
      user.changeEmail(dto.email);
    }

    // 프로필 수정
    user.updateProfile({
      name: dto.name,
      group: dto.group,
      phone: dto.phone,
      birth: dto.birth ? new Date(dto.birth) : undefined,
      gender: dto.gender,
    });

    const updatedUser = await this.userRepository.save(user);

    this.logger.log(
      `[Admin] 회원 정보 수정: ${updatedUser.name}(${updatedUser.id}) - 변경 항목: ${Object.keys(dto).join(', ')}`,
    );

    return updatedUser;
  }
}
