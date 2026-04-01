import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRetreatApplicationSchemaRenewal1775037864387 implements MigrationInterface {
  name = 'AddRetreatApplicationSchemaRenewal1775037864387';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`ApplicationMeal\` (\`id\` int NOT NULL AUTO_INCREMENT, \`applicationId\` int NOT NULL, \`retreatMealId\` int NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), UNIQUE INDEX \`ApplicationMeal_applicationId_retreatMealId_key\` (\`applicationId\`, \`retreatMealId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`RetreatMeal\` (\`id\` int NOT NULL AUTO_INCREMENT, \`retreatId\` int NOT NULL, \`dayNumber\` int NOT NULL, \`mealType\` enum ('BREAKFAST', 'LUNCH', 'DINNER') NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), UNIQUE INDEX \`RetreatMeal_retreatId_dayNumber_mealType_key\` (\`retreatId\`, \`dayNumber\`, \`mealType\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`ApplicationTransport\` (\`id\` int NOT NULL AUTO_INCREMENT, \`applicationId\` int NOT NULL, \`retreatTransportId\` int NOT NULL, \`vehicleNumber\` varchar(191) NULL, \`remark\` varchar(191) NULL, \`direction\` enum ('DEPARTURE', 'RETURN') NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), UNIQUE INDEX \`ApplicationTransport_applicationId_direction_key\` (\`applicationId\`, \`direction\`), UNIQUE INDEX \`ApplicationTransport_applicationId_retreatTransportId_key\` (\`applicationId\`, \`retreatTransportId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`RetreatTransport\` (\`id\` int NOT NULL AUTO_INCREMENT, \`retreatId\` int NOT NULL, \`direction\` enum ('DEPARTURE', 'RETURN') NOT NULL, \`transportType\` enum ('OWN_CAR', 'CARPOOL', 'BUS', 'PUBLIC', 'OTHER') NOT NULL, \`name\` varchar(191) NOT NULL, \`isRemarkRequired\` tinyint NOT NULL DEFAULT 0, \`isVehicleRequired\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), UNIQUE INDEX \`RetreatTransport_retreatId_direction_type_name_key\` (\`retreatId\`, \`direction\`, \`transportType\`, \`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`Answer\` (\`id\` int NOT NULL AUTO_INCREMENT, \`questionId\` int NOT NULL, \`applicationId\` int NOT NULL, \`questionOptionId\` int NULL, \`content\` text NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), UNIQUE INDEX \`Answer_applicationId_questionId_questionOptionId_key\` (\`applicationId\`, \`questionId\`, \`questionOptionId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`QuestionOption\` (\`id\` int NOT NULL AUTO_INCREMENT, \`questionId\` int NOT NULL, \`label\` varchar(191) NOT NULL, \`orderNo\` int NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), UNIQUE INDEX \`QuestionOption_questionId_orderNo_key\` (\`questionId\`, \`orderNo\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`Question\` (\`id\` int NOT NULL AUTO_INCREMENT, \`surveyId\` int NOT NULL, \`title\` varchar(191) NOT NULL, \`answerType\` enum ('SINGLE_SELECT', 'MULTI_SELECT', 'SUBJECTIVE') NOT NULL, \`orderNo\` int NOT NULL, \`isRequired\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), UNIQUE INDEX \`Question_surveyId_orderNo_key\` (\`surveyId\`, \`orderNo\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`Survey\` (\`id\` int NOT NULL AUTO_INCREMENT, \`retreatId\` int NOT NULL, \`surveyStartAt\` datetime(3) NOT NULL, \`surveyEndAt\` datetime(3) NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`surveyId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ApplicationMeal\` ADD CONSTRAINT \`ApplicationMeal_applicationId_fkey\` FOREIGN KEY (\`applicationId\`) REFERENCES \`Application\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ApplicationMeal\` ADD CONSTRAINT \`ApplicationMeal_retreatMealId_fkey\` FOREIGN KEY (\`retreatMealId\`) REFERENCES \`RetreatMeal\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`RetreatMeal\` ADD CONSTRAINT \`RetreatMeal_retreatId_fkey\` FOREIGN KEY (\`retreatId\`) REFERENCES \`Retreat\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ApplicationTransport\` ADD CONSTRAINT \`ApplicationTransport_applicationId_fkey\` FOREIGN KEY (\`applicationId\`) REFERENCES \`Application\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ApplicationTransport\` ADD CONSTRAINT \`ApplicationTransport_retreatTransportId_fkey\` FOREIGN KEY (\`retreatTransportId\`) REFERENCES \`RetreatTransport\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`RetreatTransport\` ADD CONSTRAINT \`RetreatTransport_retreatId_fkey\` FOREIGN KEY (\`retreatId\`) REFERENCES \`Retreat\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Answer\` ADD CONSTRAINT \`Answer_questionId_fkey\` FOREIGN KEY (\`questionId\`) REFERENCES \`Question\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Answer\` ADD CONSTRAINT \`Answer_applicationId_fkey\` FOREIGN KEY (\`applicationId\`) REFERENCES \`Application\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Answer\` ADD CONSTRAINT \`Answer_questionOptionId_fkey\` FOREIGN KEY (\`questionOptionId\`) REFERENCES \`QuestionOption\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`QuestionOption\` ADD CONSTRAINT \`QuestionOption_questionId_fkey\` FOREIGN KEY (\`questionId\`) REFERENCES \`Question\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Question\` ADD CONSTRAINT \`Question_surveyId_fkey\` FOREIGN KEY (\`surveyId\`) REFERENCES \`Survey\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Survey\` ADD CONSTRAINT \`Survey_retreatId_fkey\` FOREIGN KEY (\`retreatId\`) REFERENCES \`Retreat\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD CONSTRAINT \`Application_surveyId_fkey\` FOREIGN KEY (\`surveyId\`) REFERENCES \`Survey\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP FOREIGN KEY \`Application_surveyId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Survey\` DROP FOREIGN KEY \`Survey_retreatId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Question\` DROP FOREIGN KEY \`Question_surveyId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`QuestionOption\` DROP FOREIGN KEY \`QuestionOption_questionId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Answer\` DROP FOREIGN KEY \`Answer_questionOptionId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Answer\` DROP FOREIGN KEY \`Answer_applicationId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Answer\` DROP FOREIGN KEY \`Answer_questionId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`RetreatTransport\` DROP FOREIGN KEY \`RetreatTransport_retreatId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ApplicationTransport\` DROP FOREIGN KEY \`ApplicationTransport_retreatTransportId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ApplicationTransport\` DROP FOREIGN KEY \`ApplicationTransport_applicationId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`RetreatMeal\` DROP FOREIGN KEY \`RetreatMeal_retreatId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ApplicationMeal\` DROP FOREIGN KEY \`ApplicationMeal_retreatMealId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ApplicationMeal\` DROP FOREIGN KEY \`ApplicationMeal_applicationId_fkey\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`surveyId\``,
    );
    await queryRunner.query(`DROP TABLE \`Survey\``);
    await queryRunner.query(
      `DROP INDEX \`Question_surveyId_orderNo_key\` ON \`Question\``,
    );
    await queryRunner.query(`DROP TABLE \`Question\``);
    await queryRunner.query(
      `DROP INDEX \`QuestionOption_questionId_orderNo_key\` ON \`QuestionOption\``,
    );
    await queryRunner.query(`DROP TABLE \`QuestionOption\``);
    await queryRunner.query(
      `DROP INDEX \`Answer_applicationId_questionId_questionOptionId_key\` ON \`Answer\``,
    );
    await queryRunner.query(`DROP TABLE \`Answer\``);
    await queryRunner.query(
      `DROP INDEX \`RetreatTransport_retreatId_direction_type_name_key\` ON \`RetreatTransport\``,
    );
    await queryRunner.query(`DROP TABLE \`RetreatTransport\``);
    await queryRunner.query(
      `DROP INDEX \`ApplicationTransport_applicationId_retreatTransportId_key\` ON \`ApplicationTransport\``,
    );
    await queryRunner.query(
      `DROP INDEX \`ApplicationTransport_applicationId_direction_key\` ON \`ApplicationTransport\``,
    );
    await queryRunner.query(`DROP TABLE \`ApplicationTransport\``);
    await queryRunner.query(
      `DROP INDEX \`RetreatMeal_retreatId_dayNumber_mealType_key\` ON \`RetreatMeal\``,
    );
    await queryRunner.query(`DROP TABLE \`RetreatMeal\``);
    await queryRunner.query(
      `DROP INDEX \`ApplicationMeal_applicationId_retreatMealId_key\` ON \`ApplicationMeal\``,
    );
    await queryRunner.query(`DROP TABLE \`ApplicationMeal\``);
  }
}
