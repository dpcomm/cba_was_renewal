import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import { CarpoolService } from './carpool.service';

@Injectable()
export class CarpoolSchedulerService implements OnModuleInit {
    private readonly logger = new Logger(CarpoolSchedulerService.name);

    constructor(private readonly carpoolService: CarpoolService) {}

    onModuleInit() {
        // 매 5분마다 carpool ready 확인
        cron.schedule('*/5 * * * *', async () => {
            this.logger.log('Sending carpool ready message');
            const currentTime = new Date();
            try {
                await this.carpoolService.checkCarpoolReady(currentTime);
            } catch (err) {
                this.logger.error('Error in checkCarpoolReady', err);
            }
        });

        // 매 1시간마다 old carpool arrive update
        cron.schedule('1 * * * *', async () => {
            this.logger.log('Old carpool arrive update');
            const currentTime = new Date();
            try {
                await this.carpoolService.oldCarpoolArriveUpdate(currentTime);
            } catch (err) {
                this.logger.error('Error in oldCarpoolArriveUpdate', err);
            }
        });

    }
}
