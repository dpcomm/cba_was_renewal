import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExpoToken1767268913440 implements MigrationInterface {
    name = 'AddExpoToken1767268913440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`ExpoPushToken\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`token\` varchar(191) NOT NULL, \`provider\` varchar(255) NOT NULL DEFAULT 'expo', \`lastUsedAt\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`ExpoPushToken_token_key\` (\`token\`), INDEX \`ExpoPushToken_userId_idx\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`ExpoPushToken\` ADD CONSTRAINT \`FK_6303af29989eb6ba75ea39a3b22\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ExpoPushToken\` DROP FOREIGN KEY \`FK_6303af29989eb6ba75ea39a3b22\``);
        await queryRunner.query(`DROP INDEX \`ExpoPushToken_userId_idx\` ON \`ExpoPushToken\``);
        await queryRunner.query(`DROP INDEX \`ExpoPushToken_token_key\` ON \`ExpoPushToken\``);
        await queryRunner.query(`DROP TABLE \`ExpoPushToken\``);
    }

}
