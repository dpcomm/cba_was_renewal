import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { GetUserQuery } from '../queries/get-user.query';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UpdateUserProfileUseCase {
  private readonly logger = new Logger(UpdateUserProfileUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly getUserQuery: GetUserQuery,
  ) {}

  async execute(
    userId: number,
    dto: {
      name?: string;
      group?: string;
      phone?: string;
      birth?: string;
      gender?: string;
      password?: string;
    },
  ): Promise<User> {
    const user = await this.getUserQuery.byId(userId);

    if (dto.password) {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      user.changePassword(hashedPassword);
    }

    user.updateProfile({
      name: dto.name,
      group: dto.group,
      phone: dto.phone,
      birth: dto.birth ? new Date(dto.birth) : undefined,
      gender: dto.gender,
    });

    const updatedUser = await this.userRepository.save(user);

    this.logger.log(
      `회원 정보 수정: ${updatedUser.name}(${updatedUser.id}) - 변경 항목: ${Object.keys(dto).join(', ')}`,
    );

    return updatedUser;
  }
}
