import { MigrationInterface, QueryRunner } from "typeorm";

export class FIXCARPOOLROOMUPDATEAT1765337003166 implements MigrationInterface {
    name = 'FIXCARPOOLROOMUPDATEAT1765337003166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fix CarpoolRoom.updatedAt to have DEFAULT and ON UPDATE
        await queryRunner.query(`ALTER TABLE \`CarpoolRoom\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert to previous state (no default)
        await queryRunner.query(`ALTER TABLE \`CarpoolRoom\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL`);
    }
}
