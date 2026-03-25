// lib/mock-data.ts
// UI 개발 단계에서 사용하는 가짜(Mock) 샘플 데이터입니다.
// API 연동(Phase 3~5) 전까지 이 데이터로 화면을 개발합니다.

import type { Member, Transaction, Expense, Post } from "@/lib/types";

// ─────────────────────────────────────────
// 회원 목록 (8명)
// ─────────────────────────────────────────
export const mockMembers: Member[] = [
    {
        id: "member-1",
        name: "김민준",
        phone: "010-1234-5678",
        joinDate: "2024-01-15",
        isActive: true,
        isAdmin: true,
    },
    {
        id: "member-2",
        name: "이서연",
        phone: "010-2345-6789",
        joinDate: "2024-01-15",
        isActive: true,
        isAdmin: false,
    },
    {
        id: "member-3",
        name: "박도윤",
        phone: "010-3456-7890",
        joinDate: "2024-01-15",
        isActive: true,
        isAdmin: false,
    },
    {
        id: "member-4",
        name: "최지아",
        phone: "010-4567-8901",
        joinDate: "2024-02-01",
        isActive: true,
        isAdmin: false,
    },
    {
        id: "member-5",
        name: "정현우",
        phone: "010-5678-9012",
        joinDate: "2024-02-01",
        isActive: true,
        isAdmin: false,
    },
    {
        id: "member-6",
        name: "강수아",
        phone: "010-6789-0123",
        joinDate: "2024-03-01",
        isActive: true,
        isAdmin: false,
    },
    {
        id: "member-7",
        name: "윤준서",
        phone: "010-7890-1234",
        joinDate: "2024-03-01",
        isActive: true,
        isAdmin: false,
    },
    {
        id: "member-8",
        name: "임채원",
        phone: "010-8901-2345",
        joinDate: "2024-04-01",
        isActive: false, // 탈퇴 회원
        isAdmin: false,
    },
];

// ─────────────────────────────────────────
// 입금 내역 (2026년 1~3월, 일부 미납 포함)
// ─────────────────────────────────────────
export const mockTransactions: Transaction[] = [
    // 1월 입금 내역 (member-6, member-7 미납)
    { id: "tx-1", memberId: "member-1", memberName: "김민준", year: 2026, month: 1, amount: 50000, paidAt: "2026-01-05" },
    { id: "tx-2", memberId: "member-2", memberName: "이서연", year: 2026, month: 1, amount: 50000, paidAt: "2026-01-07" },
    { id: "tx-3", memberId: "member-3", memberName: "박도윤", year: 2026, month: 1, amount: 50000, paidAt: "2026-01-08" },
    { id: "tx-4", memberId: "member-4", memberName: "최지아", year: 2026, month: 1, amount: 50000, paidAt: "2026-01-10" },
    { id: "tx-5", memberId: "member-5", memberName: "정현우", year: 2026, month: 1, amount: 50000, paidAt: "2026-01-12" },

    // 2월 입금 내역 (member-5 미납)
    { id: "tx-6",  memberId: "member-1", memberName: "김민준", year: 2026, month: 2, amount: 50000, paidAt: "2026-02-03" },
    { id: "tx-7",  memberId: "member-2", memberName: "이서연", year: 2026, month: 2, amount: 50000, paidAt: "2026-02-05" },
    { id: "tx-8",  memberId: "member-3", memberName: "박도윤", year: 2026, month: 2, amount: 50000, paidAt: "2026-02-06" },
    { id: "tx-9",  memberId: "member-4", memberName: "최지아", year: 2026, month: 2, amount: 50000, paidAt: "2026-02-08" },
    { id: "tx-10", memberId: "member-6", memberName: "강수아", year: 2026, month: 2, amount: 50000, paidAt: "2026-02-10" },
    { id: "tx-11", memberId: "member-7", memberName: "윤준서", year: 2026, month: 2, amount: 50000, paidAt: "2026-02-15" },

    // 3월 입금 내역 (member-3, member-7 미납)
    { id: "tx-12", memberId: "member-1", memberName: "김민준", year: 2026, month: 3, amount: 50000, paidAt: "2026-03-04" },
    { id: "tx-13", memberId: "member-2", memberName: "이서연", year: 2026, month: 3, amount: 50000, paidAt: "2026-03-05" },
    { id: "tx-14", memberId: "member-4", memberName: "최지아", year: 2026, month: 3, amount: 50000, paidAt: "2026-03-07" },
    { id: "tx-15", memberId: "member-5", memberName: "정현우", year: 2026, month: 3, amount: 50000, paidAt: "2026-03-10" },
    { id: "tx-16", memberId: "member-6", memberName: "강수아", year: 2026, month: 3, amount: 50000, paidAt: "2026-03-12" },
];

// ─────────────────────────────────────────
// 지출 내역 (6개, 카테고리 다양)
// ─────────────────────────────────────────
export const mockExpenses: Expense[] = [
    {
        id: "exp-1",
        title: "1월 정기 모임 식사",
        amount: 120000,
        category: "식비",
        usedAt: "2026-01-20",
        description: "강남 고기집 단체 식사",
        photos: [],
    },
    {
        id: "exp-2",
        title: "볼링 & 노래방",
        amount: 80000,
        category: "활동비",
        usedAt: "2026-01-20",
        description: "식사 후 볼링 1게임 + 노래방",
        photos: [],
    },
    {
        id: "exp-3",
        title: "2월 정기 모임 식사",
        amount: 135000,
        category: "식비",
        usedAt: "2026-02-17",
        description: "홍대 이탈리안 레스토랑",
        photos: [],
    },
    {
        id: "exp-4",
        title: "이서연 생일 선물",
        amount: 50000,
        category: "경조사비",
        usedAt: "2026-02-20",
        description: "이서연 회원 생일 케이크 + 선물",
        photos: [],
    },
    {
        id: "exp-5",
        title: "3월 정기 모임 식사",
        amount: 140000,
        category: "식비",
        usedAt: "2026-03-16",
        description: "마포 삼겹살 + 냉면",
        photos: [],
    },
    {
        id: "exp-6",
        title: "방탈출 카페",
        amount: 90000,
        category: "활동비",
        usedAt: "2026-03-16",
        description: "홍대 방탈출 카페 (6인)",
        photos: [],
    },
];

// ─────────────────────────────────────────
// 게시글 (5개, 공지 1개 포함)
// ─────────────────────────────────────────
export const mockPosts: Post[] = [
    {
        id: "post-1",
        title: "📌 4월 정기 모임 안내",
        authorId: "member-1",
        authorName: "김민준",
        content: "안녕하세요! 4월 정기 모임 일정 안내드립니다.\n\n일시: 2026년 4월 20일 (일) 오후 6시\n장소: 홍대입구역 근처 (추후 공지)\n\n참석 여부를 댓글로 남겨주세요.",
        photos: [],
        createdAt: "2026-03-20",
        isPinned: true,
    },
    {
        id: "post-2",
        title: "3월 모임 사진 올려요 🎉",
        authorId: "member-2",
        authorName: "이서연",
        content: "이번 달 모임도 너무 즐거웠어요! 다음 달에 또 봐요 ㅎㅎ",
        photos: [],
        createdAt: "2026-03-16",
        isPinned: false,
    },
    {
        id: "post-3",
        title: "방탈출 성공했어요!!",
        authorId: "member-4",
        authorName: "최지아",
        content: "드디어 방탈출 성공! 다들 너무 잘하셨어요. 다음에 또 도전해요~",
        photos: [],
        createdAt: "2026-03-16",
        isPinned: false,
    },
    {
        id: "post-4",
        title: "2월 모임 후기",
        authorId: "member-3",
        authorName: "박도윤",
        content: "이탈리안 레스토랑 진짜 맛있었습니다. 다음에 또 가고 싶네요!",
        photos: [],
        createdAt: "2026-02-17",
        isPinned: false,
    },
    {
        id: "post-5",
        title: "1월 첫 모임 후기",
        authorId: "member-1",
        authorName: "김민준",
        content: "반성 계모임 첫 모임이었습니다. 앞으로 잘 부탁드려요!",
        photos: [],
        createdAt: "2026-01-20",
        isPinned: false,
    },
];

// ─────────────────────────────────────────
// 편의 함수: 이번 달 미납 회원 목록 반환
// ─────────────────────────────────────────
export function getUnpaidMembersThisMonth(
    members: Member[],
    transactions: Transaction[],
    year: number,
    month: number
): Member[] {
    // 이번 달 납입한 회원 ID 목록
    const paidMemberIds = transactions
        .filter((tx) => tx.year === year && tx.month === month)
        .map((tx) => tx.memberId);

    // 활성 회원 중 납입하지 않은 회원
    return members.filter(
        (m) => m.isActive && !paidMemberIds.includes(m.id)
    );
}

// 총 누적 입금액 계산
export function getTotalAmount(transactions: Transaction[]): number {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}
