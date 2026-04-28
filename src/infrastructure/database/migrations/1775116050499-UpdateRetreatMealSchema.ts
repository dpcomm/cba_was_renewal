import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRetreatMealSchema1775116050499 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add new columns
    const hasMealDay = await queryRunner.query(
      `SHOW COLUMNS FROM \`RetreatMeal\` LIKE 'meal_day'`,
    );
    if (hasMealDay.length === 0) {
      await queryRunner.query(
        'ALTER TABLE `RetreatMeal` ADD `meal_day` date NULL',
      );
    }

    const hasMealTable = await queryRunner.query(
      `SHOW COLUMNS FROM \`RetreatMeal\` LIKE 'meal_table'`,
    );
    if (hasMealTable.length === 0) {
      await queryRunner.query(
        'ALTER TABLE `RetreatMeal` ADD `meal_table` json NULL',
      );
    }

    // 2. Migrate data
    const hasDayNumberForUp = await queryRunner.query(
      `SHOW COLUMNS FROM \`RetreatMeal\` LIKE 'day_number'`,
    );
    if (hasDayNumberForUp.length > 0) {
      await queryRunner.query(`
        UPDATE \`RetreatMeal\` rm
        JOIN \`Retreat\` r ON rm.retreat_id = r.id
        SET rm.meal_day = DATE_ADD(DATE(r.retreat_start_at), INTERVAL (rm.day_number - 1) DAY)
        WHERE rm.meal_day IS NULL
      `);
    }

    // Ensure meal_day is NOT NULL after data migration
    await queryRunner.query(
      'ALTER TABLE `RetreatMeal` MODIFY `meal_day` date NOT NULL',
    );

    // 3. Create new unique index BEFORE dropping the old one
    const hasNewIndex = await queryRunner.query(
      `SHOW INDEXES FROM \`RetreatMeal\` WHERE Key_name = 'RetreatMeal_retreatId_mealDay_mealType_key'`,
    );
    if (hasNewIndex.length === 0) {
      await queryRunner.query(
        'ALTER TABLE `RetreatMeal` ADD UNIQUE INDEX `RetreatMeal_retreatId_mealDay_mealType_key` (`retreat_id`, `meal_day`, `meal_type`)',
      );
    }

    // 4. Drop old unique index
    const hasOldIndex = await queryRunner.query(
      `SHOW INDEXES FROM \`RetreatMeal\` WHERE Key_name = 'RetreatMeal_retreatId_dayNumber_mealType_key'`,
    );
    if (hasOldIndex.length > 0) {
      await queryRunner.query(
        'DROP INDEX `RetreatMeal_retreatId_dayNumber_mealType_key` ON `RetreatMeal`',
      );
    }

    // 5. Drop old column
    if (hasDayNumberForUp.length > 0) {
      await queryRunner.query(
        'ALTER TABLE `RetreatMeal` DROP COLUMN `day_number`',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Add old column
    const hasDayNumber = await queryRunner.query(
      `SHOW COLUMNS FROM \`RetreatMeal\` LIKE 'day_number'`,
    );
    if (hasDayNumber.length === 0) {
      await queryRunner.query(
        'ALTER TABLE `RetreatMeal` ADD `day_number` int NULL',
      );
    }

    // 2. Migrate data back
    const hasMealDayForDown = await queryRunner.query(
      `SHOW COLUMNS FROM \`RetreatMeal\` LIKE 'meal_day'`,
    );
    if (hasMealDayForDown.length > 0) {
      await queryRunner.query(`
        UPDATE \`RetreatMeal\` rm
        JOIN \`Retreat\` r ON rm.retreat_id = r.id
        SET rm.day_number = DATEDIFF(rm.meal_day, DATE(r.retreat_start_at)) + 1
        WHERE rm.day_number IS NULL
      `);
    }

    // Ensure day_number is NOT NULL
    await queryRunner.query(
      'ALTER TABLE `RetreatMeal` MODIFY `day_number` int NOT NULL',
    );

    // 3. Restore old unique index BEFORE dropping the new one
    const hasOldIndex = await queryRunner.query(
      `SHOW INDEXES FROM \`RetreatMeal\` WHERE Key_name = 'RetreatMeal_retreatId_dayNumber_mealType_key'`,
    );
    if (hasOldIndex.length === 0) {
      await queryRunner.query(
        'ALTER TABLE `RetreatMeal` ADD UNIQUE INDEX `RetreatMeal_retreatId_dayNumber_mealType_key` (`retreat_id`, `day_number`, `meal_type`)',
      );
    }

    // 4. Drop new unique index
    const hasNewIndex = await queryRunner.query(
      `SHOW INDEXES FROM \`RetreatMeal\` WHERE Key_name = 'RetreatMeal_retreatId_mealDay_mealType_key'`,
    );
    if (hasNewIndex.length > 0) {
      await queryRunner.query(
        'DROP INDEX `RetreatMeal_retreatId_mealDay_mealType_key` ON `RetreatMeal`',
      );
    }

    // 5. Drop new columns
    const hasMealTable = await queryRunner.query(
      `SHOW COLUMNS FROM \`RetreatMeal\` LIKE 'meal_table'`,
    );
    if (hasMealTable.length > 0) {
      await queryRunner.query(
        'ALTER TABLE `RetreatMeal` DROP COLUMN `meal_table`',
      );
    }
    if (hasMealDayForDown.length > 0) {
      await queryRunner.query(
        'ALTER TABLE `RetreatMeal` DROP COLUMN `meal_day`',
      );
    }
  }
}
