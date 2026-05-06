import { MigrationInterface, QueryRunner } from "typeorm";

export class DropFcmPushToken1777713822208 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`FcmToken\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
