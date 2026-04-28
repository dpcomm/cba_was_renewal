import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/entities/user.entity';
import { ERROR_MESSAGES } from '../../../shared/constants/error-messages';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async findOneByUserId(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  async updateUser(userId: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(userId);

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
      delete dto.password; // DTO에서 평문 비밀번호 제거
    }

    if (dto.birth) {
      user.birth = new Date(dto.birth);
      delete dto.birth;
    }

    Object.assign(user, dto);
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(
      `회원 정보 수정: ${updatedUser.name}(${updatedUser.id}) - 변경 항목: ${Object.keys(dto).join(', ')}`,
    );

    return updatedUser;
  }

  async deleteAccount(userId: number): Promise<void> {
    const user = await this.findOneById(userId);
    user.isDeleted = true;
    await this.userRepository.save(user);
    this.logger.warn(`회원 탈퇴(Soft Delete): ${user.name}(${user.id})`);
  }

  async updateEmail(userId: number, dto: UpdateEmailDto): Promise<User> {
    // 토큰 검증
    try {
      const payload = this.jwtService.verify(dto.verificationToken, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.type !== 'verification' || payload.email !== dto.email) {
        throw new BadRequestException(
          ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_INVALID,
        );
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException(
        ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_EXPIRED,
      );
    }

    const user = await this.findOneById(userId);
    user.email = dto.email;
    user.emailVerifiedAt = new Date();
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(
      `이메일 변경 완료: ${updatedUser.name}(${updatedUser.id}) -> ${dto.email}`,
    );

    return updatedUser;
  }

  async findUsersByNameAndPhone(name: string, phone: string): Promise<User[]> {
    const users = await this.userRepository.find({ where: { name, phone } });
    if (!users || users.length === 0) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return users;
  }

  async searchUsersByName(name: string): Promise<User[]> {
    if (!name.trim()) return [];
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.name LIKE :name', { name: `%${name}%` })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('user.name', 'ASC')
      .addOrderBy('user.id', 'ASC')
      .take(20)
      .getMany();
  }
}
