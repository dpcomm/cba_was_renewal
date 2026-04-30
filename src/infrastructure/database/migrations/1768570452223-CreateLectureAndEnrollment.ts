import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLectureAndEnrollment1768570452223 implements MigrationInterface {
    name = 'CreateLectureAndEnrollment1768570452223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Lecture\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`introduction\` varchar(255) NOT NULL, \`instructor\` varchar(255) NOT NULL, \`location\` varchar(255) NOT NULL, \`currentCount\` int NOT NULL DEFAULT '0', \`maxCapacity\` int NOT NULL, \`startTime\` datetime(3) NOT NULL, \`year\` int NOT NULL, \`semester\` varchar(10) NOT NULL, \`codeNumber\` varchar(10) NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), UNIQUE INDEX \`lecture_code\` (\`year\`, \`semester\`, \`codeNumber\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`LectureEnrollment\` (\`id\` int NOT NULL AUTO_INCREMENT, \`lectureId\` int NOT NULL, \`userId\` int NOT NULL, \`enrolledAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE INDEX \`lecture_enrollment_unique\` (\`lectureId\`, \`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`LectureEnrollment\` ADD CONSTRAINT \`FK_67c535f2fcb06a06f461fbeddfc\` FOREIGN KEY (\`lectureId\`) REFERENCES \`Lecture\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`LectureEnrollment\` ADD CONSTRAINT \`FK_6f8d80eeea2e450ee14e7238fe3\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`LectureEnrollment\` DROP FOREIGN KEY \`FK_6f8d80eeea2e450ee14e7238fe3\``);
        await queryRunner.query(`ALTER TABLE \`LectureEnrollment\` DROP FOREIGN KEY \`FK_67c535f2fcb06a06f461fbeddfc\``);
        await queryRunner.query(`DROP INDEX \`lecture_enrollment_unique\` ON \`LectureEnrollment\``);
        await queryRunner.query(`DROP TABLE \`LectureEnrollment\``);
        await queryRunner.query(`DROP INDEX \`lecture_code\` ON \`Lecture\``);
        await queryRunner.query(`DROP TABLE \`Lecture\``);
    }

}
