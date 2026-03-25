# PRD: 반성 계모임 관리 웹앱

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **서비스명** | 반성 |
| **서비스 유형** | 계모임 관리 웹앱 |
| **목적** | 계모임 회원의 월별 납입 현황 추적 및 지출 내역 투명화 |
| **대상 사용자** | 계모임 회원(일반), 계모임 운영자(관리자) |

---

## 2. 기술 스택

| 항목 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) | |
| UI | React 19, TypeScript | |
| 스타일링 | TailwindCSS v4 + shadcn/ui (radix-ui 기반) | |
| 아이콘 | lucide-react | |
| 데이터베이스 | Notion API | |
| 이미지 저장 | Notion 파일 첨부 | 별도 스토리지 불필요 |
| 인증 | NextAuth.js (Credentials Provider) | |
| 배포 | **Vercel (권장)** | ⚠️ 아래 주의사항 참고 |

### ⚠️ 배포 설정 변경 필요

현재 `next.config.ts`에 `output: "export"` (GitHub Pages 정적 배포)가 설정되어 있습니다.

**문제점**: 정적 배포 환경에서는 Next.js API Routes를 사용할 수 없어, Notion API Key가 클라이언트에 노출되는 **보안 위험**이 발생합니다.

**해결 방법**: `output: "export"` 설정을 제거하고 **Vercel**에 배포합니다.
- Vercel 무료 티어로 충분히 운영 가능
- Next.js API Routes를 통해 서버 사이드에서만 Notion API Key 사용
- GitHub 연동 자동 배포 지원

---

## 3. 사용자 페이지

### 3-1. 메인 페이지 (`/`)

**목적**: 계모임 현황을 한눈에 파악

| 기능 | 설명 |
|------|------|
| 총 모인 금액 | 전체 누적 입금액 합계 표시 |
| 회원 목록 카드 | 이름, 최초 입금일, 총 입금액 |
| 미납 회원 강조 | 이번 달 아직 입금하지 않은 회원 시각적 강조 표시 |
| 납입률 위젯 | 이번 달 납입 완료 인원 / 전체 인원 비율 요약 |

---

### 3-2. 게시판 페이지 (`/board`)

**목적**: 모임에서 찍은 사진 및 추억 공유

| 기능 | 설명 |
|------|------|
| 게시글 목록 | 썸네일 카드형으로 표시, 페이지네이션 |
| 게시글 상세 | 사진 + 내용 상세 보기 |
| 게시글 작성 | 제목, 내용, 사진 첨부 (Notion 파일 첨부 사용) |
| 본인 글 수정/삭제 | 로그인한 사용자 본인의 게시글만 수정/삭제 가능 |

---

### 3-3. 계좌이체 내역 페이지 (`/transactions`)

**목적**: 회원별 연/월별 입금 현황을 표 형태로 조회

| 기능 | 설명 |
|------|------|
| 입금 내역 테이블 | 회원(행) × 월(열) 형태 표 |
| 연도/월 필터 | 셀렉트박스로 원하는 기간 선택 조회 |
| 납입 상태 표시 | 각 셀에 입금 금액 또는 미납 표시 |
| 합계 표시 | 행/열 합계 자동 계산 표시 |
| 엑셀 내보내기 | 현재 조회 데이터를 엑셀 파일로 다운로드 |

---

### 3-4. 비용 사용 페이지 (`/expenses`)

**목적**: 계모임 금액이 어디에 얼마나 사용되었는지 투명하게 공개

| 기능 | 설명 |
|------|------|
| 지출 목록 | 날짜, 항목명, 금액, 카테고리, 사진 목록 표시 |
| 총 지출 합계 | 전체 지출 금액 합계 표시 |
| 카테고리 필터 | 식비 / 활동비 / 경조사비 등 카테고리별 필터 |
| 지출 상세 보기 | 상세 설명 + 첨부 사진 확인 |

---

## 4. 관리자 페이지 (`/admin/*`)

> 관리자 계정으로 로그인한 경우에만 접근 가능

### 4-1. 회원 관리 (`/admin/members`)

| 기능 | 설명 |
|------|------|
| 회원 목록 조회 | 전체 회원 목록 및 상태 확인 |
| 회원 추가 | 이름, 연락처, 가입일 입력 |
| 회원 수정 | 정보 변경 |
| 회원 삭제 | 탈퇴 처리 |
| 활성/비활성 관리 | 계모임 탈퇴 회원 비활성 처리 (데이터 보존) |

---

### 4-2. 게시판 관리 (`/admin/board`)

| 기능 | 설명 |
|------|------|
| 전체 게시글 관리 | 작성자 무관 모든 게시글 수정/삭제 |
| 게시글 등록 | 관리자 직접 게시글 작성 |
| 공지사항 핀 고정 | 중요 공지를 목록 최상단 고정 |

---

### 4-3. 입금 내역 관리 (`/admin/transactions`)

| 기능 | 설명 |
|------|------|
| 입금 내역 등록 | 회원 선택, 연도, 월, 금액 입력 |
| 입금 내역 수정/삭제 | 잘못 입력된 내역 수정 |
| 일괄 등록 | 한 달치 여러 회원 입금 내역 동시 입력 |

---

## 5. 인증 설계

| 역할 | 권한 |
|------|------|
| **비로그인** | 메인, 계좌이체 내역, 비용 사용 페이지 조회 가능 |
| **일반 회원** | 게시판 게시글 작성 + 본인 글 수정/삭제 |
| **관리자** | 전체 관리 페이지(`/admin/*`) 접근 및 모든 데이터 관리 |

- 로그인 방식: ID / 비밀번호 (NextAuth.js Credentials Provider)
- 관리자 구분: Members DB의 `isAdmin` 필드로 판별

---

## 6. Notion 데이터베이스 설계

> Notion을 데이터베이스로 활용합니다. 총 4개의 DB를 구성합니다.

### Members DB (회원)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| name | Title | 회원 이름 |
| phone | Phone | 연락처 |
| joinDate | Date | 최초 입금일 (가입일) |
| isActive | Checkbox | 활성 여부 (탈퇴 시 false) |
| isAdmin | Checkbox | 관리자 여부 |
| password | Rich Text | 로그인 비밀번호 (암호화 저장) |

### Transactions DB (입금 내역)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| title | Title | 자동 생성 (예: "홍길동 - 2025년 3월") |
| member | Relation | Members DB 연결 |
| year | Number | 연도 |
| month | Number | 월 (1~12) |
| amount | Number | 입금 금액 (원) |
| paidAt | Date | 실제 입금 날짜 |

### Expenses DB (지출 내역)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| title | Title | 지출 항목명 |
| amount | Number | 지출 금액 (원) |
| category | Select | 식비 / 활동비 / 경조사비 / 기타 |
| usedAt | Date | 사용 날짜 |
| photos | Files & Media | 영수증 / 사진 (Notion 파일 첨부) |
| description | Rich Text | 상세 설명 |

### Posts DB (게시판)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| title | Title | 게시글 제목 |
| author | Relation | Members DB 연결 |
| content | Rich Text | 게시글 내용 |
| photos | Files & Media | 첨부 사진 (Notion 파일 첨부) |
| createdAt | Date | 작성 날짜 |
| isPinned | Checkbox | 공지 고정 여부 |

---

## 7. API 설계 (Next.js API Routes)

> 모든 Notion API 호출은 서버 사이드(API Routes)에서만 처리합니다. (API Key 보안)

```
# 회원
GET    /api/members              회원 목록 조회
POST   /api/members              회원 추가
PUT    /api/members/[id]         회원 수정
DELETE /api/members/[id]         회원 삭제

# 입금 내역
GET    /api/transactions         입금 내역 조회 (?year=&month=&memberId=)
POST   /api/transactions         입금 내역 등록
PUT    /api/transactions/[id]    입금 내역 수정
DELETE /api/transactions/[id]    입금 내역 삭제

# 지출 내역
GET    /api/expenses             지출 내역 조회 (?category=)
POST   /api/expenses             지출 등록
PUT    /api/expenses/[id]        지출 수정
DELETE /api/expenses/[id]        지출 삭제

# 게시판
GET    /api/posts                게시글 목록 조회 (?page=)
POST   /api/posts                게시글 작성
PUT    /api/posts/[id]           게시글 수정
DELETE /api/posts/[id]           게시글 삭제

# 인증
POST   /api/auth/[...nextauth]   NextAuth.js 인증 처리
```

---

## 8. 화면 설계 원칙

| 원칙 | 내용 |
|------|------|
| 반응형 | 모바일 우선 (Mobile First) 설계 |
| 다크/라이트 모드 | shadcn/ui 기본 테마 시스템 활용 |
| 로딩 상태 | 스켈레톤 UI로 로딩 중 화면 처리 |
| 빈 상태 | 데이터 없을 때 Empty State UI 표시 |
| 에러 처리 | API 오류 시 토스트 메시지로 안내 |

---

## 9. 비기능 요구사항

| 항목 | 요구사항 |
|------|----------|
| 보안 | Notion API Key는 서버 사이드에서만 사용 (클라이언트 노출 금지) |
| 이미지 | Notion 파일 첨부 기능 사용 (별도 스토리지 서비스 불필요) |
| 성능 | ISR(Incremental Static Regeneration) 또는 SSR 적용으로 초기 로딩 최적화 |
| 접근성 | shadcn/ui (Radix UI 기반) 컴포넌트로 기본 접근성 준수 |
| 환경변수 | `.env.local`에 Notion API Key, Database ID 관리 |
