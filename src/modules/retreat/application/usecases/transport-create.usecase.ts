import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetreatTransport } from '../../domain/entities/retreat_transport.entity';
import { TransportDirection, TransportType } from '../../domain/enum/retreat-transport.enum';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class CreateTransportUseCase {
  private readonly logger = new Logger(CreateTransportUseCase.name);

  constructor(
    @InjectRepository(RetreatTransport)
    private readonly transportRepository: Repository<RetreatTransport>,
  ) {}

  async execute(data: {
    retreatId: number;
    direction: TransportDirection;
    transportType: TransportType;
    name: string;
    isRemarkRequired: boolean;
    isVehicleRequired: boolean;
  }): Promise<RetreatTransport> {
    const existing = await this.transportRepository.findOne({
      where: {
        retreatId: data.retreatId,
        direction: data.direction,
        transportType: data.transportType,
        name: data.name,
      },
    });

    if (existing) {
      throw new ConflictException(ERROR_MESSAGES.TRANSPORT_ALREADY_EXISTS);
    }

    const transport = this.transportRepository.create(data);
    const saved = await this.transportRepository.save(transport);

    this.logger.log(`[Admin] 교통 옵션 생성: ${saved.name} (ID: ${saved.id})`);
    return saved;
  }
}
