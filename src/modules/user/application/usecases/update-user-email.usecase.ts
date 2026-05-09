import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../domain/entities/user.entity';
import { GetUserQuery } from '../queries/get-user.query';
import { validateMailVerificationToken } from '@shared/utils/mail-verification.util';

@Injectable()
export class UpdateUserEmailUseCase {
  private readonly logger = new Logger(UpdateUserEmailUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly getUserQuery: GetUserQuery,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    userId: number,
    command: { email: string; verificationToken: string },
  ): Promise<User> {
    validateMailVerificationToken(
      this.jwtService,
      command.verificationToken,
      command.email,
    );

    const user = await this.getUserQuery.byId(userId);
    user.changeEmail(command.email);
    user.verifyEmail();

    const updatedUser = await this.userRepository.save(user);

    this.logger.log(
      `이메일 변경 완료: ${updatedUser.name}(${updatedUser.id}) -> ${command.email}`,
    );

    return updatedUser;
  }
}
