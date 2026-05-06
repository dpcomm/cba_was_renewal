import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetreatTransport } from '../../domain/entities/retreat_transport.entity';
import { ApplicationTransport } from '@modules/application/domain/entities/application_transport.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class DeleteTransportUseCase {
  private readonly logger = new Logger(DeleteTransportUseCase.name);

  constructor(
    @InjectRepository(RetreatTransport)
    private readonly transportRepository: Repository<RetreatTransport>,
    @InjectRepository(ApplicationTransport)
    private readonly applicationTransportRepository: Repository<ApplicationTransport>,
  ) {}

  async execute(id: number): Promise<void> {
    const transport = await this.transportRepository.findOne({ where: { id } });

    if (!transport) {
      throw new NotFoundException(ERROR_MESSAGES.TRANSPORT_NOT_FOUND);
    }

    const count = await this.applicationTransportRepository.count({
      where: { retreatTransportId: id },
    });

    if (count > 0) {
      throw new ConflictException(
        ERROR_MESSAGES.CANNOT_DELETE_TRANSPORT_WITH_APPLICATIONS,
      );
    }

    await this.transportRepository.delete(id);
    this.logger.log(`[Admin] 교통 옵션 삭제: ${transport.name} (ID: ${id})`);
  }
}
