import { MigrationInterface, QueryRunner } from "typeorm";

export class FixLectureAndCreateTerm1768914677050 implements MigrationInterface {
    name = 'FixLectureAndCreateTerm1768914677050'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`lecture_code\` ON \`Lecture\``);
        await queryRunner.query(`CREATE TABLE \`Term_type\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Term\` (\`id\` int NOT NULL AUTO_INCREMENT, \`year\` int NOT NULL, \`term_type_id\` int NOT NULL, \`startDate\` datetime NOT NULL, \`endDate\` datetime NOT NULL, INDEX \`IDX_2a394636e7d534d4fce10eb921\` (\`term_type_id\`), UNIQUE INDEX \`IDX_134f774ecfb867b2eab91bc874\` (\`year\`, \`term_type_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Lecture\` DROP COLUMN \`semester\``);
        await queryRunner.query(`ALTER TABLE \`Lecture\` DROP COLUMN \`year\``);
        await queryRunner.query(`ALTER TABLE \`Lecture\` ADD \`term_id\` int NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`uq_lecture_term_code\` ON \`Lecture\` (\`term_id\`, \`codeNumber\`)`);
        await queryRunner.query(`ALTER TABLE \`Term\` ADD CONSTRAINT \`FK_2a394636e7d534d4fce10eb9216\` FOREIGN KEY (\`term_type_id\`) REFERENCES \`Term_type\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Lecture\` ADD CONSTRAINT \`FK_7e7f5cb578820dbb04b4d6718b7\` FOREIGN KEY (\`term_id\`) REFERENCES \`Term\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Lecture\` DROP FOREIGN KEY \`FK_7e7f5cb578820dbb04b4d6718b7\``);
        await queryRunner.query(`ALTER TABLE \`Term\` DROP FOREIGN KEY \`FK_2a394636e7d534d4fce10eb9216\``);
        await queryRunner.query(`DROP INDEX \`uq_lecture_term_code\` ON \`Lecture\``);
        await queryRunner.query(`ALTER TABLE \`Lecture\` DROP COLUMN \`term_id\``);
        await queryRunner.query(`ALTER TABLE \`Lecture\` ADD \`year\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`Lecture\` ADD \`semester\` varchar(10) NOT NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_134f774ecfb867b2eab91bc874\` ON \`Term\``);
        await queryRunner.query(`DROP INDEX \`IDX_2a394636e7d534d4fce10eb921\` ON \`Term\``);
        await queryRunner.query(`DROP TABLE \`Term\``);
        await queryRunner.query(`DROP TABLE \`Term_type\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`lecture_code\` ON \`Lecture\` (\`year\`, \`semester\`, \`codeNumber\`)`);
    }

}
