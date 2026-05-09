# ADR 0009: Standardize DTO Architecture and Structure

## Date
2026-05-02

## Status
Accepted

## Context
프로젝트 규모가 커지면서 DTO(Data Transfer Object)와 관련된 두 가지 주요 문제점이 발견되었습니다.
1. **인스턴스화 누락**: API 응답 시 제네릭 타입 캐스팅(`ok<DTO>({ ... })`)이나 객체 리터럴(`ok(result)`)을 그대로 반환하는 패턴이 퍼져 있어, NestJS의 `ClassSerializerInterceptor` 기능이 작동하지 않는 문제가 있었습니다.
2. **폴더 구조 혼재**: `presentation/dto` 단일 폴더에 Request용과 Response용 DTO가 무분별하게 섞여 있어 파일 탐색과 유지보수가 어려웠습니다.

## Decision
이러한 문제들을 해결하고 아키텍처의 일관성을 확보하기 위해 다음 두 가지 원칙을 강제합니다.

### 1. Response DTO의 실제 인스턴스화 강제
NestJS의 직렬화 기능을 100% 활용하기 위해, 최종 응답 데이터를 반드시 DTO 클래스의 인스턴스로 변환해야 합니다.
- **객체 리터럴 및 타입 캐스팅 금지**: `return ok<DTO>({ ... })` 와 같은 제네릭 캐스팅을 금지합니다.
- **생성자 또는 Mapper 활용**: `new UserResponseDto(user)` 처럼 직접 생성자를 호출하거나, `MealMapper`와 같은 전용 매퍼 클래스를 통해 런타임 인스턴스를 반환해야 합니다.

### 2. DTO 폴더 구조 및 명명 규칙 분리
가독성 향상과 역할의 명확한 분리를 위해 DTO 파일의 구조와 이름을 강제합니다.
- **디렉토리 분리**: `presentation/dto` 하위에 반드시 `request`와 `response` 두 개의 폴더를 생성합니다.
- **파일명 규칙 (Suffix)**:
  - Request DTO: `*.request.dto.ts` (예: `update-user.request.dto.ts`)
  - Response DTO: `*.response.dto.ts` (예: `user.response.dto.ts`)

### Example
**[기존 안티 패턴]**
```typescript
// 파일 위치: presentation/dto/update-user.dto.ts (섞여 있음)

@Get('search')
async searchUsers(@Query('name') name: string) {
  const users = await this.searchUsersQuery.searchByName(name);
  const payload = users.map(user => ({ id: user.id, name: user.name }));
  
  // 인스턴스가 아닌 순수 객체 반환
  return ok<UserSearchListResponse>(payload); 
}
```

**[수정된 정석 패턴]**
```text
src/modules/user/presentation/dto/
├── request/
│   └── update-user.request.dto.ts
└── response/
    └── user-search.response.dto.ts
```
```typescript
@Get('search')
async searchUsers(@Query('name') name: string) {
  const users = await this.searchUsersQuery.searchByName(name);
  
  // 진짜 인스턴스로 매핑하여 반환
  const payload = users.map(user => new UserSearchResponseDto(user));
  return ok(payload);
}
```

## Consequences
### Positive
* **보안 및 포맷팅 보장**: `ClassSerializerInterceptor`가 정상 작동하여, 데코레이터(`@Exclude()`)만으로 민감 정보를 완벽하게 차단할 수 있습니다.
* **명확한 책임 분리**: 폴더 트리만 보아도 해당 DTO의 역할(Request/Response)을 직관적으로 파악할 수 있으며 유지보수성이 대폭 향상됩니다.

### Negative
* 기존에 작성된 많은 컨트롤러 로직과 Import 경로(`../../dto/request/...`)를 일괄 수정해야 하는 보일러플레이트 및 리팩토링 비용이 발생합니다.

## Notes
* 본 ADR은 `user` 모듈에 선제적으로 적용되어 구조 분리 및 인스턴스화 리팩토링을 완료했습니다.
* 향후 타 모듈 개발 및 리팩토링 시, 기존 ADR 0008(Presentation 계층 종속) 원칙과 함께 필수적으로 준수되어야 합니다.
