// lib/types.ts
// 프로젝트 전체에서 사용하는 데이터 타입 정의 모음
// Notion DB의 각 테이블에 대응하는 TypeScript 인터페이스입니다

// ─────────────────────────────────────────
// 회원 (Members DB)
// ─────────────────────────────────────────
export interface Member {
    id: string;           // Notion 페이지 ID
    name: string;         // 회원 이름
    phone: string;        // 연락처
    joinDate: string;     // 최초 입금일 (YYYY-MM-DD)
    isActive: boolean;    // 활성 여부 (탈퇴 시 false)
    isAdmin: boolean;     // 관리자 여부
}

// ─────────────────────────────────────────
// 입금 내역 (Transactions DB)
// ─────────────────────────────────────────
export interface Transaction {
    id: string;           // Notion 페이지 ID
    memberId: string;     // 회원 ID (Members DB 연결)
    memberName: string;   // 회원 이름 (조회 편의용)
    year: number;         // 연도 (예: 2025)
    month: number;        // 월 (1~12)
    amount: number;       // 입금 금액 (원)
    paidAt: string;       // 실제 입금 날짜 (YYYY-MM-DD)
}

// ─────────────────────────────────────────
// 지출 내역 (Expenses DB)
// ─────────────────────────────────────────
export type ExpenseCategory = "식비" | "활동비" | "경조사비" | "기타";

export interface Expense {
    id: string;                   // Notion 페이지 ID
    title: string;                // 지출 항목명
    amount: number;               // 지출 금액 (원)
    category: ExpenseCategory;   // 카테고리
    usedAt: string;               // 사용 날짜 (YYYY-MM-DD)
    description: string;          // 상세 설명
    photos: string[];             // 첨부 사진 URL 목록
}

// ─────────────────────────────────────────
// 게시글 (Posts DB)
// ─────────────────────────────────────────
export interface Post {
    id: string;           // Notion 페이지 ID
    title: string;        // 게시글 제목
    authorId: string;     // 작성자 ID (Members DB 연결)
    authorName: string;   // 작성자 이름 (조회 편의용)
    content: string;      // 게시글 내용
    photos: string[];     // 첨부 사진 URL 목록
    createdAt: string;    // 작성 날짜 (YYYY-MM-DD)
    isPinned: boolean;    // 공지 고정 여부
}

// ─────────────────────────────────────────
// 인증 세션 사용자 타입
// ─────────────────────────────────────────
export interface SessionUser {
    id: string;
    name: string;
    isAdmin: boolean;
}
