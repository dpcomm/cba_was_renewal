import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeUserGroups1779717600000 implements MigrationInterface {
  name = 'NormalizeUserGroups1779717600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`UserGroupMigrationBackup1779717600000\` (
        \`user_id\` int NOT NULL,
        \`old_group\` varchar(191) NOT NULL,
        PRIMARY KEY (\`user_id\`)
      )
    `);

    await queryRunner.query(`
      INSERT IGNORE INTO \`UserGroupMigrationBackup1779717600000\` (\`user_id\`, \`old_group\`)
      SELECT \`id\`, \`group\`
      FROM \`User\`
    `);

    await queryRunner.query(`
      UPDATE \`User\`
      SET \`group\` = CASE
        WHEN \`group\` IN (
          '권수영&임강미M',
          '노시은&윤승오M',
          '배윤희&김준영M',
          '브릿지',
          '기타'
        ) THEN \`group\`
        ELSE '기타'
      END
    `);

    await queryRunner.query(`
      ALTER TABLE \`User\`
      MODIFY \`group\` enum(
        '권수영&임강미M',
        '노시은&윤승오M',
        '배윤희&김준영M',
        '브릿지',
        '기타'
      ) NOT NULL DEFAULT '기타'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`User\`
      MODIFY \`group\` varchar(191) NOT NULL
    `);

    await queryRunner.query(`
      UPDATE \`User\` u
      JOIN \`UserGroupMigrationBackup1779717600000\` backup
        ON backup.\`user_id\` = u.\`id\`
      SET u.\`group\` = backup.\`old_group\`
    `);

    await queryRunner.query(
      `DROP TABLE IF EXISTS \`UserGroupMigrationBackup1779717600000\``,
    );
  }
}
