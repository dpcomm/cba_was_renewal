import { MigrationInterface, QueryRunner } from "typeorm";

export class FinalSyncWithRenewApplicationSpec1775041536552 implements MigrationInterface {
    name = 'FinalSyncWithRenewApplicationSpec1775041536552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0;`);

        const safeDropFK = async (table: string, fk: string) => {
            try {
                await queryRunner.query(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${fk}\``);
            } catch (e) { /* Ignore */ }
        };

        const safeDropIndex = async (table: string, idx: string) => {
            try {
                await queryRunner.query(`DROP INDEX \`${idx}\` ON \`${table}\``);
            } catch (e) { /* Ignore */ }
        };

        const safeRenameColumn = async (table: string, oldCol: string, newCol: string, definition: string) => {
            try {
                const hasOldCol = await queryRunner.query(`SHOW COLUMNS FROM \`${table}\` LIKE '${oldCol}'`);
                if (hasOldCol.length > 0) {
                    await queryRunner.query(`ALTER TABLE \`${table}\` CHANGE \`${oldCol}\` \`${newCol}\` ${definition}`);
                }
            } catch (e) { /* Ignore */ }
        };

        // 1. 컬럼명 부분 변경 복구 (Idempotent하게 Application/Retreat 남은 부분 처리)
        // Retreat 부분 복구 (location, retreat_end_at은 이미 snake_case일 수 있음)
        await safeRenameColumn('Retreat', 'createdAt', 'created_at', 'datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)');
        await safeRenameColumn('Retreat', 'updatedAt', 'updated_at', 'datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)');
        
        // Application 부분 복구 (userId, retreatId 등)
        await safeRenameColumn('Application', 'createdAt', 'created_at', 'datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)');
        await safeRenameColumn('Application', 'updatedAt', 'updated_at', 'datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)');
        await safeRenameColumn('Application', 'userId', 'user_id', 'varchar(191) NOT NULL');
        await safeRenameColumn('Application', 'retreatId', 'retreat_id', 'int NOT NULL');

        // 2. 데이터 클린업 및 기본값 삽입
        // Retreat NULL 값 처리
        await queryRunner.query(`UPDATE \`Retreat\` SET \`location\` = '장소 미정' WHERE \`location\` IS NULL`);
        // retreat_start_at 기반으로 NULL 값 채움
        const hasEndAtCol = await queryRunner.query(`SHOW COLUMNS FROM \`Retreat\` LIKE 'retreat_end_at'`);
        if (hasEndAtCol.length > 0) {
            await queryRunner.query(`UPDATE \`Retreat\` SET \`retreat_end_at\` = \`retreat_start_at\` WHERE \`retreat_end_at\` IS NULL`);
        } else {
            // camelCase 시절 컬럼이 남아있을 경우
            const hasCamelEndAt = await queryRunner.query(`SHOW COLUMNS FROM \`Retreat\` LIKE 'retreatEndAt'`);
            if (hasCamelEndAt.length > 0) {
                await queryRunner.query(`UPDATE \`Retreat\` SET \`retreatEndAt\` = \`retreat_start_at\` WHERE \`retreatEndAt\` IS NULL`);
            }
        }

        // Survey가 하나도 없는 경우 (현재 상태), 기본 설문 생성 (Application의 NOT NULL 제약조건을 위해 필수)
        const surveyCount = await queryRunner.query(`SELECT COUNT(*) as count FROM Survey`);
        if (parseInt(surveyCount[0].count) === 0) {
            await queryRunner.query(`
                INSERT INTO Survey (retreat_id, survey_start_at, survey_end_at, created_at, updated_at)
                SELECT id, created_at, DATE_ADD(created_at, INTERVAL 1 MONTH), NOW(), NOW() FROM Retreat
            `);
        }

        // Application surveyId (또는 survey_id) NULL 값 채우기
        const hasSurveyIdCamel = await queryRunner.query(`SHOW COLUMNS FROM \`Application\` LIKE 'surveyId'`);
        if (hasSurveyIdCamel.length > 0) {
            await queryRunner.query(`
                UPDATE \`Application\` SET \`surveyId\` = (SELECT id FROM Survey WHERE Survey.retreat_id = Application.retreat_id LIMIT 1)
                WHERE \`surveyId\` IS NULL
            `);
        }

        // 3. 남은 Nullability 및 최종 컬럼 변경
        await queryRunner.query(`ALTER TABLE \`Retreat\` CHANGE \`location\` \`location\` varchar(191) NOT NULL`);
        await safeRenameColumn('Retreat', 'retreatEndAt', 'retreat_end_at', 'datetime(3) NOT NULL');
        // 이미 retreat_end_at인 경우도 NOT NULL 보정
        await queryRunner.query(`ALTER TABLE \`Retreat\` CHANGE \`retreat_end_at\` \`retreat_end_at\` datetime(3) NOT NULL`);

        await safeRenameColumn('Application', 'surveyId', 'survey_id', 'int NOT NULL');
        // 이미 survey_id인 경우도 NOT NULL 보정
        await queryRunner.query(`ALTER TABLE \`Application\` CHANGE \`survey_id\` \`survey_id\` int NOT NULL`);

        // 4. 인덱스 및 제약 조건 안전하게 재생성
        const hasIdx = async (table: string, idx: string) => {
            try {
                const res = await queryRunner.query(`SHOW INDEX FROM \`${table}\` WHERE Key_name = '${idx}'`);
                return res.length > 0;
            } catch (e) { return false; }
        };
        const createIdx = async (table: string, idx: string, cols: string, unique: boolean = false) => {
            if (!(await hasIdx(table, idx))) {
                await queryRunner.query(`CREATE ${unique ? 'UNIQUE' : ''} INDEX \`${idx}\` ON \`${table}\` (${cols})`);
            }
        };

        // ... 모든 인덱스 생성 (Application, Answer, Question 등 모든 테이블 대상)
        await createIdx('ApplicationMeal', 'idx_application_meal_retreat_meal_id', '`retreat_meal_id`');
        await createIdx('ApplicationMeal', 'ApplicationMeal_applicationId_retreatMealId_key', '`application_id`, `retreat_meal_id`', true);
        await createIdx('RetreatMeal', 'RetreatMeal_retreatId_dayNumber_mealType_key', '`retreat_id`, `day_number`, `meal_type`', true);
        await createIdx('ApplicationTransport', 'idx_application_transport_retreat_transport_id', '`retreat_transport_id`');
        await createIdx('ApplicationTransport', 'ApplicationTransport_applicationId_direction_key', '`application_id`, `direction`', true);
        await createIdx('ApplicationTransport', 'ApplicationTransport_applicationId_retreatTransportId_key', '`application_id`, `retreat_transport_id`', true);
        await createIdx('RetreatTransport', 'RetreatTransport_retreatId_direction_type_name_key', '`retreat_id`, `direction`, `transport_type`, `name`', true);
        await createIdx('Answer', 'idx_answer_application_question', '`application_id`, `question_id`');
        await createIdx('Answer', 'idx_answer_question_option_id', '`question_option_id`');
        await createIdx('Answer', 'idx_answer_question_id', '`question_id`');
        await createIdx('Answer', 'Answer_applicationId_questionId_questionOptionId_key', '`application_id`, `question_id`, `question_option_id`', true);
        await createIdx('QuestionOption', 'QuestionOption_questionId_orderNo_key', '`question_id`, `order_no`', true);
        await createIdx('Question', 'Question_surveyId_orderNo_key', '`survey_id`, `order_no`', true);
        await createIdx('Survey', 'idx_survey_retreat_id', '`retreat_id`');
        await createIdx('Application', 'idx_application_retreat_checkedin', '`retreat_id`, `checked_in_at`');
        await createIdx('Application', 'idx_application_retreat_payment', '`retreat_id`, `payment_status`');
        await createIdx('Application', 'idx_application_user_id', '`user_id`');
        await createIdx('Application', 'idx_application_survey_id', '`survey_id`');
        await createIdx('Application', 'idx_application_retreat_status', '`retreat_id`, `status`');
        await createIdx('Application', 'Application_userId_retreatId_key', '`user_id`, `retreat_id`', true);

        // 5. 외래 키 제약 조건 재생성
        const safeAddFK = async (table: string, name: string, sql: string) => {
            try { await queryRunner.query(`ALTER TABLE \`${table}\` ADD CONSTRAINT \`${name}\` ${sql}`); } catch (e) { }
        };

        await safeAddFK('ApplicationMeal', 'ApplicationMeal_applicationId_fkey', 'FOREIGN KEY (`application_id`) REFERENCES `Application`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
        await safeAddFK('ApplicationMeal', 'ApplicationMeal_retreatMealId_fkey', 'FOREIGN KEY (`retreat_meal_id`) REFERENCES `RetreatMeal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
        await safeAddFK('RetreatMeal', 'RetreatMeal_retreatId_fkey', 'FOREIGN KEY (`retreat_id`) REFERENCES `Retreat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
        await safeAddFK('ApplicationTransport', 'ApplicationTransport_applicationId_fkey', 'FOREIGN KEY (`application_id`) REFERENCES `Application`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
        await safeAddFK('ApplicationTransport', 'ApplicationTransport_retreatTransportId_fkey', 'FOREIGN KEY (`retreat_transport_id`) REFERENCES `RetreatTransport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
        await safeAddFK('RetreatTransport', 'RetreatTransport_retreatId_fkey', 'FOREIGN KEY (`retreat_id`) REFERENCES `Retreat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
        await safeAddFK('Answer', 'Answer_applicationId_fkey', 'FOREIGN KEY (`application_id`) REFERENCES `Application`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
        await safeAddFK('Answer', 'Answer_questionId_fkey', 'FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
        await safeAddFK('Answer', 'Answer_questionOptionId_fkey', 'FOREIGN KEY (`question_option_id`) REFERENCES `QuestionOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
        await safeAddFK('QuestionOption', 'QuestionOption_questionId_fkey', 'FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
        await safeAddFK('Question', 'Question_surveyId_fkey', 'FOREIGN KEY (`survey_id`) REFERENCES `Survey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
        await safeAddFK('Survey', 'Survey_retreatId_fkey', 'FOREIGN KEY (`retreat_id`) REFERENCES `Retreat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
        await safeAddFK('Application', 'Application_userId_fkey', 'FOREIGN KEY (`user_id`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE');
        await safeAddFK('Application', 'Application_retreatId_fkey', 'FOREIGN KEY (`retreat_id`) REFERENCES `Retreat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
        await safeAddFK('Application', 'Application_surveyId_fkey', 'FOREIGN KEY (`survey_id`) REFERENCES `Survey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');

        await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0;`);
        await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1;`);
    }

}
