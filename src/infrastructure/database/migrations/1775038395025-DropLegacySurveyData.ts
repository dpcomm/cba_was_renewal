import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropLegacySurveyData1775038395025 implements MigrationInterface {
  name = 'DropLegacySurveyData1775038395025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`surveyData\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`surveyData\` json NULL`,
    );
  }
}
