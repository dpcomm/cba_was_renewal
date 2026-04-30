import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQRCheckInAndEvents1769408987449 implements MigrationInterface {
    name = 'AddQRCheckInAndEvents1769408987449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Application\` ADD \`checkedInAt\` datetime(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`Application\` ADD \`checkedInBy\` varchar(191) NULL`);
        await queryRunner.query(`ALTER TABLE \`Application\` ADD \`eventResult\` enum ('WIN', 'LOSE') NULL`);
        await queryRunner.query(`ALTER TABLE \`Application\` ADD \`eventParticipatedAt\` datetime(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`Retreat\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`);
        await queryRunner.query(`ALTER TABLE \`Application\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`);
        await queryRunner.query(`ALTER TABLE \`User\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`User\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`Application\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`Retreat\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`Application\` DROP COLUMN \`eventParticipatedAt\``);
        await queryRunner.query(`ALTER TABLE \`Application\` DROP COLUMN \`eventResult\``);
        await queryRunner.query(`ALTER TABLE \`Application\` DROP COLUMN \`checkedInBy\``);
        await queryRunner.query(`ALTER TABLE \`Application\` DROP COLUMN \`checkedInAt\``);
    }

}
