import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, DataSource, Between } from 'typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

import { Application } from '@modules/application/domain/entities/application.entity';

@Injectable()
export class ApplicationService {
    constructor(
        @InjectRepository(Application)
        private applicationRepository: Repository<Application>,
    ) {}

    async checkApplication(userId: string, retreatId: number): Promise<boolean> {
        const application = await this.applicationRepository.findOne({
            where: {
                userId: userId,
                retreatId: retreatId,
            },
            select: ['id'],
        });

        return !!application;
    }

    async checkApplicatinoPaid(userId: string, retreatId: number): Promise<boolean> {
        const application = await this.applicationRepository.findOne({
            where: {
                userId: userId,
                retreatId: retreatId,
            },
            select: ['feePaid'],
        });

        if (!application) {
            throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
        }

        return application.feePaid;

    }

    async getApplicationsByUserId(userId: string): Promise<number[]> {
        const applications = await this.applicationRepository.find({
            where: { userId },
            select: ['retreatId'],
            order: { createdAt: 'ASC' },
        });

        return applications.map(app => app.retreatId);
    }
}