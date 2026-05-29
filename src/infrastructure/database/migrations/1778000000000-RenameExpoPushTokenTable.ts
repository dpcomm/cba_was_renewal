import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameExpoPushTokenTable1778000000000 implements MigrationInterface {
  name = 'RenameExpoPushTokenTable1778000000000';

  private async hasIndex(
    queryRunner: QueryRunner,
    tableName: string,
    indexName: string,
  ): Promise<boolean> {
    const result = await queryRunner.query(
      `SHOW INDEX FROM \`${tableName}\` WHERE Key_name = ?`,
      [indexName],
    );

    return Array.isArray(result) && result.length > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasExpoPushToken = await queryRunner.hasTable('ExpoPushToken');
    const hasPushToken = await queryRunner.hasTable('PushToken');

    // Dev DB can already have the target table from a prior manual/partial rollout.
    if (!hasExpoPushToken && hasPushToken) {
      return;
    }

    if (hasExpoPushToken && !hasPushToken) {
      await queryRunner.query(
        'ALTER TABLE `ExpoPushToken` RENAME TO `PushToken`',
      );
    }

    if (
      await this.hasIndex(queryRunner, 'PushToken', 'ExpoPushToken_userId_idx')
    ) {
      await queryRunner.query(
        'ALTER TABLE `PushToken` RENAME INDEX `ExpoPushToken_userId_idx` TO `PushToken_userId_idx`',
      );
    }

    if (
      await this.hasIndex(queryRunner, 'PushToken', 'ExpoPushToken_token_key')
    ) {
      await queryRunner.query(
        'ALTER TABLE `PushToken` RENAME INDEX `ExpoPushToken_token_key` TO `PushToken_token_key`',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasPushToken = await queryRunner.hasTable('PushToken');
    const hasExpoPushToken = await queryRunner.hasTable('ExpoPushToken');

    if (!hasPushToken) {
      return;
    }

    if (await this.hasIndex(queryRunner, 'PushToken', 'PushToken_token_key')) {
      await queryRunner.query(
        'ALTER TABLE `PushToken` RENAME INDEX `PushToken_token_key` TO `ExpoPushToken_token_key`',
      );
    }

    if (await this.hasIndex(queryRunner, 'PushToken', 'PushToken_userId_idx')) {
      await queryRunner.query(
        'ALTER TABLE `PushToken` RENAME INDEX `PushToken_userId_idx` TO `ExpoPushToken_userId_idx`',
      );
    }

    if (!hasExpoPushToken) {
      await queryRunner.query(
        'ALTER TABLE `PushToken` RENAME TO `ExpoPushToken`',
      );
    }
  }
}
