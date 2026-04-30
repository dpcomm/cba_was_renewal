import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUpdatedAtColumnToCarpoolRoom1768237423455 implements MigrationInterface {
    name = 'FixUpdatedAtColumnToCarpoolRoom1768237423455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`CarpoolRoom\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`CarpoolRoom\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL`);
    }

}
