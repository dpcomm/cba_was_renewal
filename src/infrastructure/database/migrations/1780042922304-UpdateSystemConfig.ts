import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSystemConfig1780042922304 implements MigrationInterface {
  name = 'UpdateSystemConfig1780042922304';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE sc
      FROM \`SystemConfig\` sc
      JOIN (
        SELECT \`id\`
        FROM \`SystemConfig\`
        ORDER BY \`id\`
        LIMIT 1
      ) keep_row ON sc.\`id\` <> keep_row.\`id\`
    `);

    await queryRunner.query(`
      UPDATE \`SystemConfig\`
      SET \`id\` = 1
      WHERE \`id\` <> 1
    `);

    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`appName\` \`app_name\` varchar(191) NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`versionName\` \`version_name\` varchar(50) NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`versionCode\` \`version_code\` int NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`privacyPolicyUrl\` \`privacy_policy_url\` varchar(500) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`privacyPolicyVersion\` \`privacy_policy_version\` int NOT NULL DEFAULT '1'
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`currentTermId\` \`current_term_id\` int NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`currentRetreatId\` \`current_retreat_id\` int NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`updatedAt\` \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    `);

    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      ADD \`minimum_version_code\` int NOT NULL DEFAULT '1'
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      ADD \`privacy_policy_updated_at\` datetime(3) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      ADD \`maintenance_mode\` tinyint NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      ADD \`maintenance_message\` varchar(255) NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      MODIFY \`id\` int NOT NULL DEFAULT '1'
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      ADD CONSTRAINT \`chk_system_config_singleton\` CHECK (\`id\` = 1)
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      ADD CONSTRAINT \`FK_system_config_current_term\`
      FOREIGN KEY (\`current_term_id\`) REFERENCES \`Term\`(\`id\`)
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      ADD CONSTRAINT \`FK_system_config_current_retreat\`
      FOREIGN KEY (\`current_retreat_id\`) REFERENCES \`Retreat\`(\`id\`)
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      DROP FOREIGN KEY \`FK_system_config_current_retreat\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      DROP FOREIGN KEY \`FK_system_config_current_term\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      DROP CHECK \`chk_system_config_singleton\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      MODIFY \`id\` int NOT NULL AUTO_INCREMENT
    `);

    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      DROP COLUMN \`maintenance_message\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      DROP COLUMN \`maintenance_mode\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      DROP COLUMN \`privacy_policy_updated_at\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      DROP COLUMN \`minimum_version_code\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`updated_at\` \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`current_retreat_id\` \`currentRetreatId\` int NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`current_term_id\` \`currentTermId\` int NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`privacy_policy_version\` \`privacyPolicyVersion\` int NOT NULL DEFAULT '1'
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`privacy_policy_url\` \`privacyPolicyUrl\` varchar(500) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`version_code\` \`versionCode\` int NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`version_name\` \`versionName\` varchar(50) NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`SystemConfig\`
      CHANGE \`app_name\` \`appName\` varchar(191) NOT NULL
    `);
  }
}
