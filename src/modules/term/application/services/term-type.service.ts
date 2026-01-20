import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermType } from '@modules/term/domain/entities/term-type.entity';
import { createTermTypeRequestDto } from '../dto/term-type.request.dto';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class TermTypeService {
    constructor(
        @InjectRepository(TermType)
        private readonly termTypeRepository: Repository<TermType>,
    ) {}

    // TermType 생성
    async create(dto: createTermTypeRequestDto): Promise<TermType> {
        const exists = await this.termTypeRepository.exists({
            where: { name: dto.name },
        });

        if (exists) {
            throw new ConflictException('TermType already exists');
        }

        const termType = this.termTypeRepository.create({
            name: dto.name,
        });

        return this.termTypeRepository.save(termType);
    }
    
    // Term 생성 시 사용 가능한 TermType 목록 조회
    async findAll(): Promise<TermType[]> {
        return this.termTypeRepository.find({
            order: { id: 'ASC' },
        });
    }

    // Term 생성 시 단건 확인용
    async findById(id: number): Promise<TermType> {
        const type = await this.termTypeRepository.findOne({
            where: { id },
        });

        if (!type) {
            throw new NotFoundException(ERROR_MESSAGES.TERM_TYPE_NOT_FOUND)
        }

        return type;
    }
}
