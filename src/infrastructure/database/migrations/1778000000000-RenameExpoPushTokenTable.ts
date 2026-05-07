import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameExpoPushTokenTable1778000000000
  implements MigrationInterface
{
  name = 'RenameExpoPushTokenTable1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `ExpoPushToken` RENAME TO `PushToken`',
    );
    await queryRunner.query(
      'ALTER TABLE `PushToken` RENAME INDEX `ExpoPushToken_userId_idx` TO `PushToken_userId_idx`',
    );
    await queryRunner.query(
      'ALTER TABLE `PushToken` RENAME INDEX `ExpoPushToken_token_key` TO `PushToken_token_key`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `PushToken` RENAME INDEX `PushToken_token_key` TO `ExpoPushToken_token_key`',
    );
    await queryRunner.query(
      'ALTER TABLE `PushToken` RENAME INDEX `PushToken_userId_idx` TO `ExpoPushToken_userId_idx`',
    );
    await queryRunner.query(
      'ALTER TABLE `PushToken` RENAME TO `ExpoPushToken`',
    );
  }
}
