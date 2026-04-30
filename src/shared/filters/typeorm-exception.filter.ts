import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';
import { fail } from '../responses/api-response';

/**
 * TypeORM QueryFailedError를 잡아서 적절한 HTTP 응답으로 변환하는 글로벌 예외 필터.
 *
 * 처리 케이스:
 * - ER_DUP_ENTRY (1062): 409 Conflict
 * - ER_NO_REFERENCED_ROW_2 (1452): 400 Bad Request (FK 삽입/수정 위반)
 * - ER_ROW_IS_REFERENCED_2 (1451): 409 Conflict (FK 삭제 위반)
 * - 기타: 500 Internal Server Error
 */
@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // TypeORM은 실제 DB 에러를 driverError에 담아주는 경우가 많음
    const driverError = (exception as any).driverError || exception;
    const errorCode = driverError.code || driverError.errno;

    // 1. 중복 키 에러 (ER_DUP_ENTRY / 1062)
    if (errorCode === 'ER_DUP_ENTRY' || errorCode === 1062) {
      const field = this.extractDuplicateField(driverError.message);

      // 추출된 필드명이 해시값 형태라면 일반 메시지로 Fallback
      const isHash = field && field.length > 20;
      const message =
        field && !isHash
          ? `The ${field} is already in use.`
          : 'Duplicate data already exists.';

      this.logger.warn(`[ER_DUP_ENTRY] ${driverError.message}`);

      return response
        .status(HttpStatus.CONFLICT)
        .json(fail(message, null, HttpStatus.CONFLICT));
    }

    // 2. FK 제약 – 참조 대상이 존재하지 않음 (ER_NO_REFERENCED_ROW_2 / 1452)
    if (errorCode === 'ER_NO_REFERENCED_ROW_2' || errorCode === 1452) {
      this.logger.warn(`[ER_FK_NO_REF] ${driverError.message}`);
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json(
          fail(
            'Referenced resource does not exist.',
            null,
            HttpStatus.BAD_REQUEST,
          ),
        );
    }

    // 3. FK 제약 – 다른 테이블이 참조 중이라 삭제/수정 불가 (ER_ROW_IS_REFERENCED_2 / 1451)
    if (errorCode === 'ER_ROW_IS_REFERENCED_2' || errorCode === 1451) {
      this.logger.warn(`[ER_FK_IN_USE] ${driverError.message}`);
      return response
        .status(HttpStatus.CONFLICT)
        .json(
          fail(
            'Cannot delete or update: this resource is still referenced by other data.',
            null,
            HttpStatus.CONFLICT,
          ),
        );
    }

    // 4. 그 외 예상치 못한 DB 에러 → 500
    this.logger.error(
      `[QueryFailedError] ${exception.message}`,
      exception.stack,
    );

    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(
        fail(
          'An unexpected database error occurred.',
          null,
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
  }

  /**
   * MySQL 중복 에러 메시지에서 중복된 필드명을 추출합니다.
   * 예시: "Duplicate entry 'test@email.com' for key 'UQ_email'" → "email"
   */
  private extractDuplicateField(message: string): string | null {
    // 키 이름 추출 방어 로직 (정규식이 실패해도 앱이 죽지 않도록)
    try {
      const match = message.match(
        /for key ['`](?:.*\.)?(?:UQ_|IDX_)?(\w+)['`]/i,
      );
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
