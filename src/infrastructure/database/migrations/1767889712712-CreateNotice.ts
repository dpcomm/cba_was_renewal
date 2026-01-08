import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotice1767889712712 implements MigrationInterface {
    name = 'CreateNotice1767889712712'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Notice\` (\`id\` int NOT NULL AUTO_INCREMENT, \`author\` varchar(50) NOT NULL, \`title\` varchar(50) NOT NULL, \`body\` varchar(191) NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`Notice\``);
    }

}
