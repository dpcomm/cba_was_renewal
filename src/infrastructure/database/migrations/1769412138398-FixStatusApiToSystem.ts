import { MigrationInterface, QueryRunner } from "typeorm";

export class FixStatusApiToSystem1769412138398 implements MigrationInterface {
    name = 'FixStatusApiToSystem1769412138398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`SystemConfig\` (\`id\` int NOT NULL AUTO_INCREMENT, \`appName\` varchar(191) NOT NULL, \`versionName\` varchar(50) NOT NULL, \`versionCode\` int NOT NULL, \`privacyPolicyUrl\` varchar(500) NULL, \`privacyPolicyVersion\` int NOT NULL DEFAULT '1', \`currentTermId\` int NULL, \`currentRetreatId\` int NULL, \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`SystemConfig\``);
    }

}
