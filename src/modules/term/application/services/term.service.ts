import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Term } from '@modules/term/domain/entities/term.entity';
import { TermType } from '@modules/term/domain/entities/term-type.entity';
import { Lecture } from '@modules/lecture/domain/entities/lecture.entity';
import { 
    createTermRequestDto,
    updateTermRequestDto,
    getTermFilterDto, 
} from '../dto/term.request.dto';

@Injectable()
export class TermService {
    constructor(
        @InjectRepository(Term)
        private readonly termRepository: Repository<Term>,

        @InjectRepository(Lecture)
        private readonly lectureRepository: Repository<Lecture>,

        @InjectRepository(TermType)
        private readonly termTypeRepository: Repository<TermType>,
    ) {}

    // Term 생성
    async create(dto: createTermRequestDto ): Promise<Term> {
        // termType 존재 여부 확인
        const termType = await this.termTypeRepository.findOne({
            where: { id: dto.termTypeId },
        });

        if (!termType) {
            throw new NotFoundException('TermType not found');
        }

        // year + termType 조합 중복 방지
        const exists = await this.termRepository.exists({
            where: {
                year: dto.year,
                termTypeId: dto.termTypeId,
            },
        });

        if (exists) {
            throw new ConflictException(
                'Term with same year and termType already exists',
            );
        }

        const term = this.termRepository.create({
            year: dto.year,
            termType,
            termTypeId: dto.termTypeId,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
        });

        return this.termRepository.save(term);
    }

    // Term 목록 조회 (필터 기반)
    async getTerms(filter: getTermFilterDto): Promise<Term[]> {
        const qb = this.termRepository
            .createQueryBuilder('term')
            .leftJoinAndSelect('term.termType', 'termType');

        if (filter.year !== undefined) {
            qb.andWhere('term.year = :year', { year: filter.year });
        }

        if (filter.termTypeId !== undefined) {
            qb.andWhere('term.termTypeId = :termTypeId', {
                termTypeId: filter.termTypeId,
            });
        }

        return qb
            .orderBy('term.year', 'DESC')
            .addOrderBy('termType.id', 'ASC')
            .getMany();
    }

    // Term 단건 조회
    async getTermById(termId: number): Promise<Term> {
        const term = await this.termRepository.findOne({
            where: { id: termId },
            relations: ['termType'],
        });

        if (!term) {
            throw new NotFoundException('Term not found');
        }

        return term;
    }    

    // Term 일부 컬럼 수정
    async update(dto: updateTermRequestDto ): Promise<Term> {
        const term = await this.termRepository.findOne({
            where: { id: dto.termId },
            relations: ['termType'],
        });

        if (!term) {
            throw new NotFoundException('Term not found');
        }

        const updatableFields: (keyof updateTermRequestDto)[] = [
            'startDate',
            'endDate',
        ];

        for (const key of updatableFields) {
            const value = dto[key];
            if (value == null) continue;

            if (key === 'startDate') {
                term.startDate = new Date(value as any);
            } else if (key === 'endDate') {
                term.endDate = new Date(value as any);
            } else {
                (term as any)[key] = value;
            }
        }

        return this.termRepository.save(term);
    }

    
    // Term에 속한 Lecture 조회
    async findLectures(termId: number): Promise<Lecture[]> {
        const termExists = await this.termRepository.exists({
            where: { id: termId },
        });

        if (!termExists) {
            throw new NotFoundException('Term not found');
        }

        return this.lectureRepository.find({
            where: { term: { id: termId }, },
            relations: ['term', 'term.termType'],
            order: { codeNumber: 'ASC', },
        });
    }
}
