import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSurveyTitleAndApplicationAdminMemo1780270000000
  implements MigrationInterface
{
  name = 'AddSurveyTitleAndApplicationAdminMemo1780270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasSurveyTitle = await queryRunner.query(
      `SHOW COLUMNS FROM \`Survey\` LIKE 'title'`,
    );
    if (hasSurveyTitle.length === 0) {
      await queryRunner.query(
        `ALTER TABLE \`Survey\` ADD \`title\` varchar(191) NULL`,
      );
    }

    await queryRunner.query(`
      UPDATE \`Survey\` s
      JOIN \`Retreat\` r ON r.id = s.retreat_id
      SET s.title = CONCAT(r.title, ' 신청서')
      WHERE s.title IS NULL OR s.title = ''
    `);

    await queryRunner.query(
      `ALTER TABLE \`Survey\` MODIFY \`title\` varchar(191) NOT NULL`,
    );

    const hasAdminMemo = await queryRunner.query(
      `SHOW COLUMNS FROM \`Application\` LIKE 'admin_memo'`,
    );
    if (hasAdminMemo.length === 0) {
      await queryRunner.query(
        `ALTER TABLE \`Application\` ADD \`admin_memo\` text NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasAdminMemo = await queryRunner.query(
      `SHOW COLUMNS FROM \`Application\` LIKE 'admin_memo'`,
    );
    if (hasAdminMemo.length > 0) {
      await queryRunner.query(
        `ALTER TABLE \`Application\` DROP COLUMN \`admin_memo\``,
      );
    }

    const hasSurveyTitle = await queryRunner.query(
      `SHOW COLUMNS FROM \`Survey\` LIKE 'title'`,
    );
    if (hasSurveyTitle.length > 0) {
      await queryRunner.query(`ALTER TABLE \`Survey\` DROP COLUMN \`title\``);
    }
  }
}
