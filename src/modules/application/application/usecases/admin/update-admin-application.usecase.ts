import { Application } from '@modules/application/domain/entities/application.entity';
import { ApplicationMeal } from '@modules/application/domain/entities/application_meal.entity';
import { ApplicationTransport } from '@modules/application/domain/entities/application_transport.entity';
import {
  ApplicationStatus,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';
import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity';
import { RetreatTransport } from '@modules/retreat/domain/entities/retreat_transport.entity';
import { TransportDirection } from '@modules/retreat/domain/enum/retreat-transport.enum';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { DataSource, EntityManager, In } from 'typeorm';

export interface UpdateAdminApplicationTransportCommand {
  retreatTransportId: number;
  vehicleNumber?: string | null;
  remark?: string | null;
}

export interface UpdateAdminApplicationCommand {
  retreatMealIds?: number[];
  transports?: UpdateAdminApplicationTransportCommand[];
  paymentStatus?: PaymentStatus;
  checkedIn?: boolean;
}

export interface UpdatedAdminApplicationTransport {
  retreatTransportId: number;
  direction: TransportDirection;
  vehicleNumber: string | null;
  remark: string | null;
}

export interface UpdateAdminApplicationResult {
  retreatMealIds?: number[];
  transports?: UpdatedAdminApplicationTransport[];
  paymentStatus?: PaymentStatus;
  applicationStatus?: ApplicationStatus;
  checkedInAt?: Date | null;
}

@Injectable()
export class UpdateAdminApplicationUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(
    applicationId: number,
    command: UpdateAdminApplicationCommand,
  ): Promise<UpdateAdminApplicationResult> {
    if (
      command.retreatMealIds === undefined &&
      command.transports === undefined &&
      command.paymentStatus === undefined &&
      command.checkedIn === undefined
    ) {
      throw new BadRequestException(ERROR_MESSAGES.APPLICATION_UPDATE_REQUIRED);
    }

    return this.dataSource.transaction(async (manager) => {
      const application = await manager.findOne(Application, {
        where: { id: applicationId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!application) {
        throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
      }

      if (
        command.checkedIn !== undefined &&
        application.status === ApplicationStatus.CANCELED
      ) {
        throw new ConflictException(
          ERROR_MESSAGES.CANCELED_APPLICATION_CHECK_IN_NOT_ALLOWED,
        );
      }

      const mealIds = command.retreatMealIds
        ? await this.validateMeals(
            manager,
            application.retreatId,
            command.retreatMealIds,
          )
        : command.retreatMealIds;
      const transports = command.transports
        ? await this.validateTransports(
            manager,
            application.retreatId,
            command.transports,
          )
        : command.transports;

      if (mealIds !== undefined) {
        await manager.delete(ApplicationMeal, { applicationId });
        if (mealIds.length) {
          await manager.save(
            ApplicationMeal,
            mealIds.map((retreatMealId) =>
              manager.create(ApplicationMeal, {
                applicationId,
                retreatMealId,
              }),
            ),
          );
        }
      }

      if (transports !== undefined) {
        await manager.delete(ApplicationTransport, { applicationId });
        if (transports.length) {
          await manager.save(
            ApplicationTransport,
            transports.map((transport) =>
              manager.create(ApplicationTransport, {
                applicationId,
                ...transport,
              }),
            ),
          );
        }
      }

      if (command.paymentStatus !== undefined) {
        application.changePaymentStatus(command.paymentStatus);
      }
      if (command.checkedIn !== undefined) {
        application.changeCheckInStatus(command.checkedIn);
      }
      if (
        command.paymentStatus !== undefined ||
        command.checkedIn !== undefined
      ) {
        await manager.save(Application, application);
      }

      return {
        retreatMealIds: mealIds,
        transports,
        paymentStatus:
          command.paymentStatus === undefined
            ? undefined
            : application.paymentStatus,
        applicationStatus:
          command.checkedIn === undefined ? undefined : application.status,
        checkedInAt:
          command.checkedIn === undefined ? undefined : application.checkedInAt,
      };
    });
  }

  private async validateMeals(
    manager: EntityManager,
    retreatId: number,
    retreatMealIds: number[],
  ): Promise<number[]> {
    const uniqueIds = [...new Set(retreatMealIds)];
    if (uniqueIds.length !== retreatMealIds.length) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_APPLICATION_MEAL_SELECTION,
      );
    }

    const meals = uniqueIds.length
      ? await manager.find(RetreatMeal, { where: { id: In(uniqueIds) } })
      : [];
    if (
      meals.length !== uniqueIds.length ||
      meals.some((meal) => meal.retreatId !== retreatId)
    ) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_APPLICATION_MEAL_SELECTION,
      );
    }
    return uniqueIds;
  }

  private async validateTransports(
    manager: EntityManager,
    retreatId: number,
    commands: UpdateAdminApplicationTransportCommand[],
  ): Promise<UpdatedAdminApplicationTransport[]> {
    const ids = commands.map((command) => command.retreatTransportId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_APPLICATION_TRANSPORT_SELECTION,
      );
    }

    const options = ids.length
      ? await manager.find(RetreatTransport, { where: { id: In(ids) } })
      : [];
    if (
      options.length !== ids.length ||
      options.some((option) => option.retreatId !== retreatId)
    ) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_APPLICATION_TRANSPORT_SELECTION,
      );
    }

    const optionById = new Map(options.map((option) => [option.id, option]));
    if (
      new Set(options.map((option) => option.direction)).size !== ids.length
    ) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_APPLICATION_TRANSPORT_SELECTION,
      );
    }

    return commands.map((command) => {
      const option = optionById.get(command.retreatTransportId)!;
      const vehicleNumber = command.vehicleNumber?.trim() || null;
      const remark = command.remark?.trim() || null;

      if (option.isVehicleRequired && !vehicleNumber) {
        throw new BadRequestException(
          ERROR_MESSAGES.TRANSPORT_VEHICLE_NUMBER_REQUIRED,
        );
      }
      if (option.isRemarkRequired && !remark) {
        throw new BadRequestException(ERROR_MESSAGES.TRANSPORT_REMARK_REQUIRED);
      }

      return {
        retreatTransportId: option.id,
        direction: option.direction,
        vehicleNumber,
        remark,
      };
    });
  }
}
