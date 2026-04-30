import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailToUser1766719130649 implements MigrationInterface {
    name = 'AddEmailToUser1766719130649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`User\` ADD \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`User\` ADD UNIQUE INDEX \`IDX_User_email\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`User\` ADD \`emailVerifiedAt\` datetime(3) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`User\` DROP COLUMN \`emailVerifiedAt\``);
        await queryRunner.query(`ALTER TABLE \`User\` DROP INDEX \`IDX_User_email\``);
        await queryRunner.query(`ALTER TABLE \`User\` DROP COLUMN \`email\``);
    }
}
