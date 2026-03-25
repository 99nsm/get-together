---
name: get-together 프로젝트 컨텍스트
description: 반성 계모임 관리 웹앱 프로젝트의 주요 결정사항 및 개발 전략
type: project
---

"반성" 계모임 관리 웹앱 프로젝트. Next.js 16 + TailwindCSS v4 + shadcn/ui 기반.

**Why:** 계모임 납입 현황 추적 및 지출 내역 투명화. Notion을 DB로 사용해 별도 서버 비용 없음.

**핵심 개발 전략 (UI 우선 2단계)**
- 1단계: Mock 데이터로 UI 완성 (Phase 0~2) → 사용자 확인 후 2단계 진행
- 2단계: Notion 연동 + NextAuth + API Routes + 배포 (Phase 3~6)

**현재 상태 (2026-03-25 기준)**
- next.config.ts에 `output: "export"` + `basePath` 설정이 잔존 → Phase 0 첫 태스크로 제거 필요
- app/ 디렉토리 미생성 (모든 기능 미구현)
- 패키지: next-auth, @notionhq/client 미설치

**How to apply:** Phase 0 진행 시 next.config.ts 수정이 최우선. UI 작업 중 API 연동 요청이 와도 Phase 3 이전에는 Mock 데이터로 처리.

**주요 가정사항**
- 비밀번호는 bcrypt 해싱 후 Notion DB에 저장
- 지출 등록 권한 = 관리자 전용 (PRD에 명시 없음)
- Notion 이미지 URL 만료(1시간) 처리 방식은 Phase 5에서 결정
