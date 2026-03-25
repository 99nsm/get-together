// app/page.tsx
// 메인 페이지 (/) - 계모임 현황 대시보드
// 서버 컴포넌트: Notion DB에서 실제 회원·입금 데이터를 가져와 표시합니다.
// dynamic = 'force-dynamic': 빌드 시 정적 렌더링을 하지 않고 요청 시마다 최신 데이터를 가져옵니다.
export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Wallet } from "lucide-react";
import { getMembers, getTransactions } from "@/lib/notion-api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function HomePage() {
    // 현재 날짜 기준 연도/월 계산
    const now = new Date();
    const CURRENT_YEAR = now.getFullYear();
    const CURRENT_MONTH = now.getMonth() + 1; // getMonth()는 0부터 시작

    // Notion DB에서 회원 목록과 올해 입금 내역을 동시에 가져옴
    const [members, transactions] = await Promise.all([
        getMembers(),
        getTransactions(CURRENT_YEAR),
    ]);

    // 활성 회원만 필터링 (탈퇴 회원 제외)
    const activeMembers = members.filter((m) => m.isActive);

    // 이번 달 입금한 회원 ID 목록 (Set으로 빠른 조회)
    const paidMemberIds = new Set(
        transactions
            .filter((tx) => tx.month === CURRENT_MONTH)
            .map((tx) => tx.memberId)
    );

    const unpaidCount = activeMembers.filter((m) => !paidMemberIds.has(m.id)).length;
    const paidCount = activeMembers.length - unpaidCount;

    // 납입률 (0~100 정수)
    const paymentRate =
        activeMembers.length > 0
            ? Math.round((paidCount / activeMembers.length) * 100)
            : 0;

    // 전체 누적 입금액 합산
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // 회원별 총 납입액 + 이달 납입 여부 계산
    const memberStats = activeMembers.map((member) => {
        const memberTotal = transactions
            .filter((tx) => tx.memberId === member.id)
            .reduce((sum, tx) => sum + tx.amount, 0);
        const isPaidThisMonth = paidMemberIds.has(member.id);
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

                {activeMembers.length === 0 ? (
                    <EmptyState />
                ) : (
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
        <Card className={isPaidThisMonth ? "" : "border-destructive/50 bg-destructive/5"}>
            <CardContent className="pt-4">
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
                    {isPaidThisMonth ? (
                        <Badge variant="outline" className="text-green-600 border-green-600 shrink-0">
                            납입완료
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="shrink-0">미납</Badge>
                    )}
                </div>
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
