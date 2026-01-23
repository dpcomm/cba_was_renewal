import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Application } from "./domain/entities/application.entity";
import { ApplicationController } from "./presentation/controller/application.controller";
import { ApplicationService } from "./application/services/application.service";

@Module({
    imports: [TypeOrmModule.forFeature([Application])],
    controllers: [ApplicationController],
    providers: [ApplicationService],
})

export class ApplicationModule {}