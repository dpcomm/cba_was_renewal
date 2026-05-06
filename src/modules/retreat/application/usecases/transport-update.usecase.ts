import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetreatTransport } from '../../domain/entities/retreat_transport.entity';
import { TransportDirection, TransportType } from '../../domain/enum/retreat-transport.enum';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class UpdateTransportUseCase {
  private readonly logger = new Logger(UpdateTransportUseCase.name);

  constructor(
    @InjectRepository(RetreatTransport)
    private readonly transportRepository: Repository<RetreatTransport>,
  ) {}

  async execute(
    id: number,
    data: {
      direction?: TransportDirection;
      transportType?: TransportType;
      name?: string;
      isRemarkRequired?: boolean;
      isVehicleRequired?: boolean;
    },
  ): Promise<RetreatTransport> {
    const transport = await this.transportRepository.findOne({ where: { id } });

    if (!transport) {
      throw new NotFoundException(ERROR_MESSAGES.TRANSPORT_NOT_FOUND);
    }

    transport.update(data);
    const updated = await this.transportRepository.save(transport);

    this.logger.log(`[Admin] 교통 옵션 수정: ${updated.name} (ID: ${updated.id})`);
    return updated;
  }
}
