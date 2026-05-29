import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApplicationRetreatStatusPaymentIndex1779717700000 implements MigrationInterface {
  name = 'AddApplicationRetreatStatusPaymentIndex1779717700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasIndex = await queryRunner.query(`
      SHOW INDEXES FROM \`Application\`
      WHERE Key_name = 'idx_application_retreat_status_payment'
    `);

    if (hasIndex.length === 0) {
      await queryRunner.query(`
        CREATE INDEX \`idx_application_retreat_status_payment\`
        ON \`Application\` (\`retreat_id\`, \`status\`, \`payment_status\`)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasIndex = await queryRunner.query(`
      SHOW INDEXES FROM \`Application\`
      WHERE Key_name = 'idx_application_retreat_status_payment'
    `);

    if (hasIndex.length > 0) {
      await queryRunner.query(`
        DROP INDEX \`idx_application_retreat_status_payment\` ON \`Application\`
      `);
    }
  }
}
