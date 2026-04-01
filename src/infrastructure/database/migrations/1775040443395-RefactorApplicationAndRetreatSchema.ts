import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorApplicationAndRetreatSchema1775040443395 implements MigrationInterface {
  name = 'RefactorApplicationAndRetreatSchema1775040443395';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 신규 컬럼 추가 (데이터 이관 전까지는 NULL 허용)
    await queryRunner.query(
      `ALTER TABLE \`Retreat\` ADD \`location\` varchar(191) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Retreat\` ADD \`retreat_start_at\` datetime(3) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Retreat\` ADD \`retreat_end_at\` datetime(3) NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`status\` enum ('SUBMITTED', 'CANCELED', 'CHECKED_IN') NOT NULL DEFAULT 'SUBMITTED'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`payment_status\` enum ('PENDING', 'PAID', 'REFUNDED', 'EXEMPTED') NOT NULL DEFAULT 'PENDING'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`checked_in_at\` datetime(3) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`event_result\` enum ('WIN', 'LOSE') NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`event_participated_at\` datetime(3) NULL`,
    );

    // 2. 데이터 이관
    // Retreat: date -> retreat_start_at
    await queryRunner.query(
      `UPDATE \`Retreat\` SET \`retreat_start_at\` = \`date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Retreat\` MODIFY \`retreat_start_at\` datetime(3) NOT NULL`,
    );

    // Application: status (attended=true 혹은 checkedInBy가 있으면 CHECKED_IN)
    await queryRunner.query(
      `UPDATE \`Application\` SET \`status\` = 'CHECKED_IN' WHERE \`attended\` = 1 OR \`checkedInBy\` IS NOT NULL`,
    );

    // Application: payment_status (feePaid=true 이면 PAID)
    await queryRunner.query(
      `UPDATE \`Application\` SET \`payment_status\` = 'PAID' WHERE \`feePaid\` = 1`,
    );

    // Application: timestamp 데이터 복사 및 snake_case 동기화
    await queryRunner.query(
      `UPDATE \`Application\` SET \`checked_in_at\` = \`checkedInAt\``,
    );
    await queryRunner.query(
      `UPDATE \`Application\` SET \`event_result\` = \`eventResult\``,
    );
    await queryRunner.query(
      `UPDATE \`Application\` SET \`event_participated_at\` = \`eventParticipatedAt\``,
    );

    // 3. 기존 컬럼 삭제
    await queryRunner.query(`ALTER TABLE \`Retreat\` DROP COLUMN \`date\``);
    await queryRunner.query(`ALTER TABLE \`Application\` DROP COLUMN \`idn\``);
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`attended\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`feePaid\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`checkedInAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`checkedInBy\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`eventResult\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`eventParticipatedAt\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. 기존 컬럼 복구
    await queryRunner.query(
      `ALTER TABLE \`Retreat\` ADD \`date\` datetime(3) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`idn\` varchar(191) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`attended\` tinyint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`feePaid\` tinyint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`checkedInAt\` datetime(3) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`checkedInBy\` varchar(191) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`eventResult\` enum ('WIN', 'LOSE') NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` ADD \`eventParticipatedAt\` datetime(3) NULL`,
    );

    // 2. 데이터 복구
    await queryRunner.query(
      `UPDATE \`Retreat\` SET \`date\` = \`retreat_start_at\``,
    );
    await queryRunner.query(
      `UPDATE \`Application\` SET \`attended\` = 1 WHERE \`status\` = 'CHECKED_IN'`,
    );
    await queryRunner.query(
      `UPDATE \`Application\` SET \`feePaid\` = 1 WHERE \`payment_status\` = 'PAID'`,
    );
    await queryRunner.query(
      `UPDATE \`Application\` SET \`checkedInAt\` = \`checked_in_at\``,
    );
    await queryRunner.query(
      `UPDATE \`Application\` SET \`eventResult\` = \`event_result\``,
    );
    await queryRunner.query(
      `UPDATE \`Application\` SET \`eventParticipatedAt\` = \`event_participated_at\``,
    );

    // 3. 신규 컬럼 삭제
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`event_participated_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`event_result\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`checked_in_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`payment_status\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Application\` DROP COLUMN \`status\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Retreat\` DROP COLUMN \`retreat_end_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`Retreat\` DROP COLUMN \`retreat_start_at\``,
    );
    await queryRunner.query(`ALTER TABLE \`Retreat\` DROP COLUMN \`location\``);
  }
}
