# 운영(Production) 환경 DB 리뉴얼 마이그레이션 가이드

수련회 신청 시스템의 데이터베이스 스키마와 데이터를 최신 전용 테이블 구조로 안전하게 이관하기 위한 최종 절차입니다.
기존 계획되었던 별도 데이터 마이그레이션 스크립트 방식 대신, **데이터 보전형 SQL 마이그레이션(TypeORM)** 방식을 사용하여 안정성과 데이터 무결성을 확보했습니다.

## ⚠️ 마이그레이션 전략 개요

1.  **데이터 무손실 이관**: `DROP/ADD` 대신 `CHANGE COLUMN`을 사용하여 기존 신청 데이터를 보존하며 컬럼명만 변경합니다.
2.  **Idempotent(멱등성) 확보**: 마이그레이션이 실패하더라도 재시도가 가능하도록 존재 여부를 확인하고 에러를 처리하는 로직이 포함되어 있습니다.
3.  **데이터 정합성 자동 복구**: `NOT NULL` 제약 조건 추가 시 발생할 수 있는 NULL 데이터에 대해 기본값 채우기 및 기본 설문 자동 생성 기능이 포함되어 있습니다.

---

## 🚀 상세 진행 스텝

### Step 1. 운영 DB 백업 (필수)

운영 DB 관리 콘솔(AWS RDS 등)에서 DB 인스턴스 스냅샷을 찍어둡니다. 마이그레이션은 원격 실행되므로 네트워크 이슈 등에 대비해야 합니다.

### Step 2. 신규 코드 배포 (WAS Deploy)

변경된 엔티티와 마이그레이션 파일이 포함된 신규 버전을 배포합니다.

```bash
# 빌드 수행
npm run build
```

### Step 3. 마이그레이션 실행

별도의 마이그레이션 스크립트(`migrate-survey-data.ts`)를 실행할 필요 없이, 다음 명령어로 모든 스키마 변경 및 데이터 클린업을 한 번에 완료합니다.

```bash
# 상용 DB 환경변수 주입 상태에서 실행
npm run typeorm migration:run -- -d src/infrastructure/database/data-source.ts
```

> [!NOTE]
> **마이그레이션이 처리하는 작업 리스트:**
>
> - `Retreat.location` 등 NULL 데이터 기본값 업데이트
> - `Survey` 데이터가 없는 수련회에 대해 기본 설문 1건 자동 생성
> - `Application` 데이터를 신규 생성된 설문에 자동 연결 (survey_id 채우기)
> - 모든 컬럼명을 `snake_case`로 변경 및 `NOT NULL` 제약 조건 적용
> - 신규 명세 기반 인덱스 및 외래 키(Foreign Key) 일괄 재생성

### Step 4. 최종 데이터 검증

정상적으로 데이터가 연결되었는지 확인하기 위해 다음 쿼리를 운영 DB에서 실행해 봅니다.

```sql
-- 모든 신청서가 유효한 survey_id를 가지고 있는지 확인
SELECT COUNT(*) FROM Application WHERE survey_id IS NULL; -- 결과가 0이어야 함

-- 수련회별 설문 생성 여부 확인
SELECT retreat_id, COUNT(*) FROM Survey GROUP BY retreat_id;
```

### Step 5. 레거시 데이터(`surveyData`) 정리 (선택)

안정화 기간(1~2주일)이 지난 후, 더 이상 쓰지 않는 기존 `Application.surveyData` 컬럼을 삭제하는 마이그레이션을 추가 실행하여 DB를 정리합니다.

---

이 가이드는 실무에서 검증된 `FinalSyncWithRenewApplicationSpec` 마이그레이션 파일을 기반으로 작성되었습니다.
