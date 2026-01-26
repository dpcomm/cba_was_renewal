import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Term } from '@modules/term/domain/entities/term.entity';
import { Lecture } from '@modules/lecture/domain/entities/lecture.entity';
import {
  createTermRequestDto,
  updateTermRequestDto,
} from '../dto/term.request.dto';

@Injectable()
export class TermService {
  constructor(
    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,
  ) {}

  // Term 생성
  async create(dto: createTermRequestDto): Promise<Term> {
    const term = this.termRepository.create({
      name: dto.name,
      description: dto.description ?? '',
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });

    return this.termRepository.save(term);
  }

  // Term 목록 조회
  async getTerms(): Promise<Term[]> {
    return this.termRepository.find();
  }

  // Term 단건 조회
  async getTermById(termId: number): Promise<Term> {
    const term = await this.termRepository.findOne({
      where: { id: termId },
    });

    if (!term) {
      throw new NotFoundException('Term not found');
    }

    return term;
  }

  // Term 일부 컬럼 수정
  async update(dto: updateTermRequestDto): Promise<Term> {
    const term = await this.termRepository.findOne({
      where: { id: dto.termId },
    });

    if (!term) {
      throw new NotFoundException('Term not found');
    }

    const updatableFields: (keyof updateTermRequestDto)[] = [
      'name',
      'description',
      'startDate',
      'endDate',
    ];

    for (const key of updatableFields) {
      const value = dto[key];
      if (value == null) continue;

      if (key === 'startDate' || key === 'endDate') {
        term[key] = new Date(value as any);
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
      where: { term: { id: termId } },
      relations: ['term'],
      order: { codeNumber: 'ASC' },
    });
  }
}
