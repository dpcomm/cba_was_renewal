import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRetreatAddress1780530000000 implements MigrationInterface {
  name = 'AddRetreatAddress1780530000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasAddress = await queryRunner.query(
      `SHOW COLUMNS FROM \`Retreat\` LIKE 'address'`,
    );

    if (hasAddress.length === 0) {
      await queryRunner.query(
        `ALTER TABLE \`Retreat\` ADD \`address\` varchar(500) NOT NULL DEFAULT ''`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasAddress = await queryRunner.query(
      `SHOW COLUMNS FROM \`Retreat\` LIKE 'address'`,
    );

    if (hasAddress.length > 0) {
      await queryRunner.query(
        `ALTER TABLE \`Retreat\` DROP COLUMN \`address\``,
      );
    }
  }
}
