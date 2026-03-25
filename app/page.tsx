// app/page.tsx
// 메인 페이지 (/) - 계모임 현황 대시보드
// 총 모인 금액, 이달 납입률, 회원별 납입 현황 카드를 보여줍니다.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Wallet } from "lucide-react";
import {
    mockMembers,
    mockTransactions,
    getUnpaidMembersThisMonth,
    getTotalAmount,
} from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

// 현재 기준 연도/월 (Phase 5에서 실제 날짜로 대체)
const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 3;

export default function HomePage() {
    // 활성 회원만 필터링 (탈퇴 회원 제외)
    const activeMembers = mockMembers.filter((m) => m.isActive);

    // 이번 달 미납 회원 목록
    const unpaidMembers = getUnpaidMembersThisMonth(
        mockMembers,
        mockTransactions,
        CURRENT_YEAR,
        CURRENT_MONTH
    );

    // 납입 완료 인원 = 활성 회원 수 - 미납 회원 수
    const paidCount = activeMembers.length - unpaidMembers.length;

    // 납입률 (0~100 정수)
    const paymentRate =
        activeMembers.length > 0
            ? Math.round((paidCount / activeMembers.length) * 100)
            : 0;

    // 전체 누적 입금액
    const totalAmount = getTotalAmount(mockTransactions);

    // 회원별 총 납입액 + 이달 납입 여부 계산
    const memberStats = activeMembers.map((member) => {
        const memberTotal = mockTransactions
            .filter((tx) => tx.memberId === member.id)
            .reduce((sum, tx) => sum + tx.amount, 0);
        const isPaidThisMonth = !unpaidMembers.find((u) => u.id === member.id);
        return { ...member, memberTotal, isPaidThisMonth };
    });

    return (
        <div className="space-y-6">
            {/* ── 페이지 제목 ── */}
            <div>
                <h1 className="text-2xl font-bold">계모임 현황</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    {CURRENT_YEAR}년 {CURRENT_MONTH}월 기준
                </p>
            </div>

            {/* ── 상단 요약 위젯 2개 ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* 총 모인 금액 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            총 모인 금액
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
                        <p className="text-xs text-muted-foreground mt-1">전체 회원 누적 입금액</p>
                    </CardContent>
                </Card>

                {/* 이달 납입률 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            이달 납입률
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{paymentRate}%</p>
                        {/* 납입률 진행 바 */}
                        <Progress value={paymentRate} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {paidCount}명 / {activeMembers.length}명 납입 완료
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ── 회원 납입 현황 목록 ── */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">회원 납입 현황</h2>
                    <Badge variant="secondary">{activeMembers.length}명</Badge>
                </div>

                {/* 빈 상태: 회원이 아무도 없을 때 */}
                {activeMembers.length === 0 ? (
                    <EmptyState />
                ) : (
                    /* 카드 그리드: 모바일 1열 / sm 2열 / lg 3열 */
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {memberStats.map((member) => (
                            <MemberCard
                                key={member.id}
                                name={member.name}
                                joinDate={member.joinDate}
                                isAdmin={member.isAdmin}
                                memberTotal={member.memberTotal}
                                isPaidThisMonth={member.isPaidThisMonth}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// 회원 카드: 한 명의 납입 현황을 보여주는 카드
// ─────────────────────────────────────────
function MemberCard({
    name,
    joinDate,
    isAdmin,
    memberTotal,
    isPaidThisMonth,
}: {
    name: string;
    joinDate: string;
    isAdmin: boolean;
    memberTotal: number;
    isPaidThisMonth: boolean;
}) {
    return (
        // 미납 회원은 빨간 테두리로 강조
        <Card
            className={
                isPaidThisMonth
                    ? ""
                    : "border-destructive/50 bg-destructive/5"
            }
        >
            <CardContent className="pt-4">
                {/* 이름 + 관리자 뱃지 + 납입 상태 뱃지 */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="font-semibold">{name}</p>
                            {isAdmin && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                    관리자
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            가입일: {formatDate(joinDate)}
                        </p>
                    </div>

                    {/* 납입완료 / 미납 뱃지 */}
                    {isPaidThisMonth ? (
                        <Badge
                            variant="outline"
                            className="text-green-600 border-green-600 shrink-0"
                        >
                            납입완료
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="shrink-0">
                            미납
                        </Badge>
                    )}
                </div>

                {/* 총 납입액 */}
                <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">총 납입액</p>
                    <p className="font-bold text-lg">{formatCurrency(memberTotal)}</p>
                </div>
            </CardContent>
        </Card>
    );
}

// ─────────────────────────────────────────
// 빈 상태: 회원이 한 명도 없을 때 표시
// ─────────────────────────────────────────
function EmptyState() {
    return (
        <div className="text-center py-16 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">등록된 회원이 없습니다</p>
            <p className="text-sm mt-1">관리자 페이지에서 회원을 추가해주세요</p>
        </div>
    );
}
