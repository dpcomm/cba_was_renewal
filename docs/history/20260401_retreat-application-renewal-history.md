# 수련회 신청 시스템 리뉴얼 (Application Renewal) 결과 히스토리

본 문서는 수련회 신청 시스템의 데이터베이스 스키마 리팩토링 및 데이터 마이그레이션 작업의 전체 과정과 최종 결과를 기록한 문서입니다.

## 1. 프로젝트 개요

- **목적**: 기존 `Application.surveyData` JSON 컬럼에 저장되던 파편화된 데이터를 정규화하여 관리 효율성과 데이터 무결성을 확보함.
- **최종 결과**: `renew_application.spec.md` 명세와 DB 스키마가 100% 일치하도록 동기화 완료.

## 2. 주요 작업 단계 및 실제 진행 과정

### Phase 1: 엔티티 정규화 (Normalization)

- **대상**: `Retreat`, `Survey`, `Question`, `QuestionOption`, `Application`, `Answer`, `ApplicationMeal`, `ApplicationTransport` 등 10여 개 엔티티.
- **주요 변경**:
  - 모든 컬럼명을 `snake_case`로 통일 (명세 준수).
  - 수련회 신청 성능 최적화를 위한 필수 인덱스(5개 이상) 추가.
  - 데이터 무결성을 위한 `NOT NULL` 제약 조건 강화 (`location`, `retreat_end_at`, `survey_id` 등).

### Phase 2: 데이터 보존 및 이관 전략 (Data Preservation)

- **전략 변경**: 초기에는 별도의 TS 이관 스크립트(`migrate-survey-data.ts`)를 계획했으나, 실행 안정성과 무손실 이관을 위해 **TypeORM 수동 SQL 마이그레이션 방식**으로 선회함.
- **기술적 해결**:
  - `DROP/ADD` 대신 `ALTER TABLE ... CHANGE COLUMN` 명령을 사용하여 기존 신청 데이터를 보존하며 컬럼명만 변경.
  - `1775041536552-FinalSyncWithRenewApplicationSpec.ts` 마이그레이션 파일 하나로 전체 동기화 및 클린업 수행.

### Phase 3: 예외 상황 대응 및 복구 (Recovery)

- **NULL 데이터 대응**: 명세상 `NOT NULL` 필수 컬럼인 `location`, `retreat_end_at` 등에 대해 기존 데이터가 NULL인 경우, '장소 미정' 또는 '시작일자 동일' 값으로 자동 업데이트하여 제약 조건 충족.
- **누락 설문 복구**: `Application.survey_id`가 필수임에도 연관 설문(`Survey`)이 없는 상황을 감지하여, 수련회별 **기본 설문 자동 생성** 로직을 마이그레이션에 포함해 시스템 마비를 방지함.

### Phase 4: 최종 최적화 및 정리

- 멱등성(Idempotent)을 확보한 마이그레이션으로 재시도 가능한 안정성 확보.
- 불필요한 분석용 스크립트 및 중복 문서 정리 완료.

## 3. 최종 상태 요약

- **명세 일치도**: 100% 동기화됨 (`docs/specs/renew_application.md`).
- **데이터 건수**: 약 663건의 기존 신청서 데이터 무손실 이관 완료.
- **성능 개선**: 주요 조회 조건에 인덱스가 적용되어 통계 및 조회 속도 향상 기대.

---

_Last Updated: 2026-04-01_
