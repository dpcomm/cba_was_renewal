# AI Agents Guide (스펙 주도 개발)

이 프로젝트는 **스펙 주도 개발(Specification-Driven Development, SDD)**을 기반으로 AI 에이전트와 협업하는 방식을 채택합니다.

## 🤖 에이전트 목록 (SOP)

이 폴더(`docs/agents/`)에는 각 목적에 맞는 AI 에이전트의 역할과 작업 원칙(SOP: Standard Operating Procedure)이 명문화되어 있습니다. 작업을 요청할 때 에이전트 파일을 언급하여 명확한 페르소나를 부여하세요.

- **[SPEC_CODER_SOP.md](./SPEC_CODER_SOP.md)**
  - 기능 개발, 버그 수정, 아키텍처 리팩토링 등을 수행하는 **메인 코딩 에이전트**입니다.
  - 명세서 준수, 예외 테스트 코드 작성, DDD 구조 유지를 최우선 목표로 합니다.

## 🛠️ AI와 협업하는 올바른 패턴

1. **명세서 최신화**
   - 개발/변경하려는 내용이 `docs/specs/` 내의 문서에 먼저 정의되어 있어야 합니다.
   - 인공지능이 코드를 짜기 전 기댈 수 있는 **유일한 진실 공급원(Single Source of Truth)**입니다.

2. **작업 요청 (프롬프팅 예시)**
   - _"@[SPEC_CODER_SOP.md] 원칙에 따라, 이번에 새로 추가한 @[functional-specs.md] 의 'X번: 식사 관리 기능' 명세를 구현해줘."_
   - _"@[SPEC_CODER_SOP.md] 내가 만든 @[application.service.ts] 에 대해 명세서에 빠진 엣지 케이스가 없는지 확인하고 테스트 코드를 채워줘."_

3. **검증 및 리뷰**
   - 에이전트가 제시한 `implementation_plan.md`를 꼼꼼히 리뷰합니다.
   - 실행된 `npm run test` 결과를 확인합니다.
