# 시스템 설정 기능 명세

## 0. 문서 정보

- 상태: Implemented (E2E 환경 검증 대기)
- 담당: Joey
- 목표 마감일: 2026-06-21
- 관련 기능명세: `docs/specs/back-office-functional.spec.md`
- 관련 ADR:
  - `docs/adr/0001-adopt-ddd-3-layer-architecture.md`
  - `docs/adr/0006-adopt-specification-driven-ai-development.md`
  - `docs/adr/0007-adopt-rich-domain-entity-and-usecase-pattern.md`
  - `docs/adr/0008-enforce-strict-dto-separation-in-cqrs.md`
  - `docs/adr/0009-standardize-dto-architecture.md`

---

## 1. 목적

시스템 설정은 앱과 백오피스에서 공통으로 참조하는 운영 설정 데이터를 관리한다.

운영자는 백오피스에서 현재 운영 기준이 되는 수련회와 선택식 강의 시즌을 변경할 수 있어야 한다.

---

## 2. 회의 확정 범위

### 2.1 시스템 설정

- 현재 수련회 선택
- 현재 선택식 강의 시즌 선택

### 2.2 공통 원칙

- 시스템 설정 데이터는 앱과 백오피스가 공통으로 참조한다.
- 시스템 설정 변경은 관리자만 수행할 수 있다.
- 앱은 관리자용 관리 정보가 아닌 실제 사용에 필요한 설정만 조회한다.

### 2.3 범위 제외

- 롤링배너 관리는 이번 시스템 설정 작업 범위에서 제외한다.
- 롤링배너는 메인 페이지에서 이미지가 자동 전환되는 캐러셀 기능이며, Oracle Object Storage에 저장된 이미지 파일을 연결하는 방식으로 별도 담당자가 구현한다.

---

## 3. 현재 구현 상태

### 3.1 구현 완료된 기반 기능

- `SystemConfig`는 단일 레코드(`id = 1`)로 관리한다.
- `currentRetreatId`로 현재 수련회를 지정할 수 있다.
- `currentTermId`로 현재 선택식 강의 시즌을 지정할 수 있다.
- 현재 설정 조회 API가 존재한다.
- 관리자용 수련회·시즌 선택 옵션 조회 API가 존재한다.
- 관리자용 시스템 설정 수정 API가 존재한다.

### 3.2 이번 작업 구현 결과

- 기존 `SystemService`를 제거하고 조회 Query와 수정 UseCase로 책임을 분리했다.
- DTO를 `presentation/dto/request`, `presentation/dto/response`로 분리했다.
- 응답 DTO를 생성자를 통해 실제 인스턴스로 반환하도록 변경했다.
- 현재 수련회·시즌 선택, 해제, 존재 검증 단위 테스트를 추가했다.
- 공용 설정 조회, 관리자 권한, 설정 변경 E2E 테스트를 추가했다.
- E2E 테스트는 개발 DB 및 Redis 연결 환경에서 최종 검증이 필요하다.

---

## 4. 현재 수련회 및 선택식 강의 시즌

### 4.1 비즈니스 규칙

- 현재 수련회는 존재하는 `Retreat`만 선택할 수 있다.
- 현재 선택식 강의 시즌은 존재하는 `Term`만 선택할 수 있다.
- 현재 수련회와 시즌은 각각 선택 해제할 수 있다.
- 시스템 설정 변경 시 `SystemConfig`의 단일 레코드를 수정한다.
- 선택된 수련회가 삭제되면 DB 외래 키 정책에 따라 현재 수련회 설정은 `NULL`이 된다.
- 선택된 시즌이 삭제되면 DB 외래 키 정책에 따라 현재 시즌 설정은 `NULL`이 된다.

### 4.2 조회 규칙

- 앱과 백오피스가 사용하는 공용 설정 조회는 현재 선택된 수련회와 시즌의 ID 및 요약 정보를 반환한다.
- 관리자 선택 옵션은 모든 수련회와 시즌을 최신순으로 반환한다.
- 수련회 옵션 라벨은 `Retreat.title`을 사용한다.
- 시즌 옵션 라벨은 `Term.name`을 사용한다.

### 4.3 API

#### 공용 시스템 설정 조회

```http
GET /system
```

반환 데이터에 다음 값을 포함한다.

- `currentRetreatId`
- `currentRetreat`
- `currentTermId`
- `currentTerm`
- 기존 애플리케이션 버전, 개인정보 처리방침, 점검 모드 설정

#### 관리자 선택 옵션 조회

```http
GET /admin/system/options
```

반환 데이터에 다음 값을 포함한다.

- 현재 선택된 수련회 ID
- 현재 선택된 시즌 ID
- 선택 가능한 수련회 목록
- 선택 가능한 시즌 목록

#### 관리자 시스템 설정 수정

```http
PUT /admin/system
```

요청 예시:

```json
{
  "currentRetreatId": 3,
  "currentTermId": 5
}
```

선택 해제 요청 예시:

```json
{
  "currentRetreatId": null,
  "currentTermId": null
}
```

### 4.4 예외 규칙

- 존재하지 않는 `currentRetreatId`를 요청하면 `400 Bad Request`를 반환한다.
- 존재하지 않는 `currentTermId`를 요청하면 `400 Bad Request`를 반환한다.
- 관리자 권한이 없는 사용자가 관리자 API를 호출하면 `403 Forbidden`을 반환한다.

---

## 5. 아키텍처 및 구현 규칙

- Presentation -> Application -> Domain 의존성 방향을 지킨다.
- 조회 기능은 Query, 변경 기능은 UseCase로 구현한다.
- 웹 DTO는 `presentation/dto/request`, `presentation/dto/response`에만 둔다.
- Controller는 Request DTO를 순수 파라미터로 변환하여 Query/UseCase에 전달한다.
- Response DTO는 생성자 또는 Presentation Mapper를 통해 실제 인스턴스로 반환한다.
- 성공 응답은 `ok(data)`를 사용한다.
- 실패 응답은 NestJS Exception과 `ERROR_MESSAGES` 상수를 사용한다.
- 관리자 API는 `admin/` 접두사와 클래스 레벨 `@AdminGuard()`를 적용한다.

---

## 6. 구현 결과

### Phase 1. 기존 시스템 설정 정비 완료

- 시스템 설정 조회를 Query로 분리
- 시스템 설정 선택 옵션 조회를 Query로 분리
- 시스템 설정 수정을 UseCase로 분리
- 공통 에러 메시지 추가
- Request/Response DTO 구조 정리
- 현재 수련회·시즌 선택 및 해제 테스트 추가

### Phase 2. 검증 결과

- Query/UseCase 단위 테스트 작성 완료
- 공용 설정 조회 및 관리자 권한 E2E 테스트 작성 완료
- `npm run test`: 통과
- `npm run build`: 통과
- 변경 파일 ESLint: 통과
- `npm run test:e2e -- --runInBand --testPathPatterns=system.e2e-spec.ts`: 개발 DB 및 Redis 연결 타임아웃으로 실행 미완료

---

## 7. 테스트 시나리오

### 시스템 설정

- 존재하는 수련회를 현재 수련회로 선택할 수 있다.
- 존재하는 시즌을 현재 시즌으로 선택할 수 있다.
- 현재 수련회와 시즌을 `null`로 해제할 수 있다.
- 존재하지 않는 수련회 또는 시즌 선택은 실패한다.
- 관리자 권한이 없는 사용자의 설정 변경은 실패한다.
