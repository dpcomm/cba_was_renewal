import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInstructorBioToLecture1769027300000 implements MigrationInterface {
  name = 'AddInstructorBioToLecture1769027300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`Lecture\` ADD \`instructorBio\` varchar(255) NOT NULL DEFAULT 'CBA 대학청년부 선교사'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`Lecture\` DROP COLUMN \`instructorBio\``,
    );
  }
}
