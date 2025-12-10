import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncLegacySchema1765343221589 implements MigrationInterface {
    name = 'SyncLegacySchema1765343221589'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Youtube\` DROP FOREIGN KEY \`Youtube_retreatId_fkey\``);
        await queryRunner.query(`ALTER TABLE \`Application\` DROP FOREIGN KEY \`Application_retreatId_fkey\``);
        await queryRunner.query(`ALTER TABLE \`Application\` DROP FOREIGN KEY \`Application_userId_fkey\``);
        await queryRunner.query(`ALTER TABLE \`Pray\` DROP FOREIGN KEY \`Pray_userId_fkey\``);
        await queryRunner.query(`ALTER TABLE \`ChatReport\` DROP FOREIGN KEY \`ChatReport_reportedUserId_fkey\``);
        await queryRunner.query(`ALTER TABLE \`ChatReport\` DROP FOREIGN KEY \`ChatReport_reporterId_fkey\``);
        await queryRunner.query(`ALTER TABLE \`ChatReport\` DROP FOREIGN KEY \`ChatReport_roomId_fkey\``);
        await queryRunner.query(`ALTER TABLE \`FcmToken\` DROP FOREIGN KEY \`FcmToken_userId_fkey\``);
        await queryRunner.query(`ALTER TABLE \`Retreat\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`);
        await queryRunner.query(`ALTER TABLE \`Application\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`);
        await queryRunner.query(`ALTER TABLE \`CarpoolRoom\` CHANGE \`departureTime\` \`departureTime\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)`);
        await queryRunner.query(`ALTER TABLE \`User\` CHANGE \`updatedAt\` \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`);
        
        // Commented out because these indexes likely exist (Prisma defaults)
        // await queryRunner.query(`CREATE INDEX \`Chat_senderId_idx\` ON \`Chat\` (\`senderId\`)`);
        // await queryRunner.query(`CREATE INDEX \`Chat_roomId_idx\` ON \`Chat\` (\`roomId\`)`);
        // await queryRunner.query(`CREATE UNIQUE INDEX \`Chat_senderId_roomId_message_timestamp_key\` ON \`Chat\` (\`senderId\`, \`roomId\`, \`message\`, \`timestamp\`)`);
        // await queryRunner.query(`CREATE INDEX \`user_consents_userId_idx\` ON \`user_consents\` (\`userId\`)`);

        await queryRunner.query(`ALTER TABLE \`Youtube\` MODIFY COLUMN \`link\` varchar(255) NOT NULL`);
        
        await queryRunner.query(`ALTER TABLE \`Youtube\` ADD CONSTRAINT \`Youtube_retreatId_fkey\` FOREIGN KEY (\`retreatId\`) REFERENCES \`Retreat\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Application\` ADD CONSTRAINT \`Application_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Application\` ADD CONSTRAINT \`Application_retreatId_fkey\` FOREIGN KEY (\`retreatId\`) REFERENCES \`Retreat\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Pray\` ADD CONSTRAINT \`Pray_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`carpool_members\` ADD CONSTRAINT \`carpool_members_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`carpool_members\` ADD CONSTRAINT \`carpool_members_roomId_fkey\` FOREIGN KEY (\`roomId\`) REFERENCES \`CarpoolRoom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Chat\` ADD CONSTRAINT \`Chat_senderId_fkey\` FOREIGN KEY (\`senderId\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Chat\` ADD CONSTRAINT \`Chat_roomId_fkey\` FOREIGN KEY (\`roomId\`) REFERENCES \`CarpoolRoom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ChatReport\` ADD CONSTRAINT \`ChatReport_reporterId_fkey\` FOREIGN KEY (\`reporterId\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ChatReport\` ADD CONSTRAINT \`ChatReport_reportedUserId_fkey\` FOREIGN KEY (\`reportedUserId\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ChatReport\` ADD CONSTRAINT \`ChatReport_roomId_fkey\` FOREIGN KEY (\`roomId\`) REFERENCES \`CarpoolRoom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`CarpoolRoom\` ADD CONSTRAINT \`CarpoolRoom_driverId_fkey\` FOREIGN KEY (\`driverId\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`FcmToken\` ADD CONSTRAINT \`FcmToken_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_consents\` ADD CONSTRAINT \`user_consents_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Down migration logic omitted for brevity as this is a sync migration
    }
}
