import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteTermType1769014595683 implements MigrationInterface {
    name = 'DeleteTermType1769014595683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Term\` DROP FOREIGN KEY \`FK_2a394636e7d534d4fce10eb9216\``);
        await queryRunner.query(`DROP INDEX \`IDX_134f774ecfb867b2eab91bc874\` ON \`Term\``);
        await queryRunner.query(`DROP INDEX \`IDX_2a394636e7d534d4fce10eb921\` ON \`Term\``);
        await queryRunner.query(`ALTER TABLE \`Term\` DROP COLUMN \`year\``);
        await queryRunner.query(`ALTER TABLE \`Term\` DROP COLUMN \`term_type_id\``);
        await queryRunner.query(`ALTER TABLE \`Term\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`Term\` ADD \`description\` varchar(255) NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Term\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`Term\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`Term\` ADD \`term_type_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`Term\` ADD \`year\` int NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_2a394636e7d534d4fce10eb921\` ON \`Term\` (\`term_type_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_134f774ecfb867b2eab91bc874\` ON \`Term\` (\`year\`, \`term_type_id\`)`);
        await queryRunner.query(`ALTER TABLE \`Term\` ADD CONSTRAINT \`FK_2a394636e7d534d4fce10eb9216\` FOREIGN KEY (\`term_type_id\`) REFERENCES \`Term_type\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
