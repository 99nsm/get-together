// app/transactions/page.tsx
// 계좌이체 내역 페이지 (/transactions)
// 회원 × 월 형태의 테이블로 납입 현황을 보여줍니다.
// 연도 필터로 조회 연도를 선택할 수 있습니다.
// Phase 1: "use client"로 연도 필터 상태 관리, Mock 데이터 사용

"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from "@/components/ui/table";
import { mockMembers, mockTransactions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Mock 데이터에 존재하는 연도 목록 추출
const availableYears = [...new Set(mockTransactions.map((tx) => tx.year))].sort(
    (a, b) => b - a
);

export default function TransactionsPage() {
    // 현재 선택된 연도 (기본값: 가장 최근 연도)
    const [selectedYear, setSelectedYear] = useState(availableYears[0] ?? 2026);

    // 선택된 연도의 활성 회원 목록
    const activeMembers = mockMembers.filter((m) => m.isActive);

    // 선택된 연도에 존재하는 월 목록 (오름차순)
    const months = [
        ...new Set(
            mockTransactions
                .filter((tx) => tx.year === selectedYear)
                .map((tx) => tx.month)
        ),
    ].sort((a, b) => a - b);

    // 특정 회원·연도·월의 입금 내역 조회 헬퍼
    function getTransaction(memberId: string, month: number) {
        return mockTransactions.find(
            (tx) =>
                tx.memberId === memberId &&
                tx.year === selectedYear &&
                tx.month === month
        );
    }

    // 회원별 연간 합계
    function getMemberTotal(memberId: string) {
        return mockTransactions
            .filter((tx) => tx.memberId === memberId && tx.year === selectedYear)
            .reduce((sum, tx) => sum + tx.amount, 0);
    }

    // 월별 합계 (열 합계)
    function getMonthTotal(month: number) {
        return mockTransactions
            .filter((tx) => tx.year === selectedYear && tx.month === month)
            .reduce((sum, tx) => sum + tx.amount, 0);
    }

    // 전체 합계
    const grandTotal = months.reduce((sum, m) => sum + getMonthTotal(m), 0);

    return (
        <div className="space-y-6">
            {/* ── 헤더 ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-2xl font-bold">계좌이체 내역</h1>

                <div className="flex items-center gap-2">
                    {/* 연도 필터 */}
                    <Select
                        value={String(selectedYear)}
                        onValueChange={(v) => setSelectedYear(Number(v))}
                    >
                        <SelectTrigger className="w-28">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                    {year}년
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* 엑셀 내보내기 버튼 (Phase 4에서 기능 구현) */}
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        엑셀 내보내기
                    </Button>
                </div>
            </div>

            {/* ── 납입 현황 테이블 ── */}
            {months.length === 0 ? (
                <p className="text-center py-16 text-muted-foreground">
                    {selectedYear}년 입금 내역이 없습니다.
                </p>
            ) : (
                /* 모바일에서 가로 스크롤 가능하도록 overflow-x-auto */
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {/* 행 헤더: 회원 이름 */}
                                <TableHead className="sticky left-0 bg-background min-w-24">
                                    회원
                                </TableHead>
                                {/* 열 헤더: 월 */}
                                {months.map((month) => (
                                    <TableHead key={month} className="text-center min-w-24">
                                        {month}월
                                    </TableHead>
                                ))}
                                {/* 행 합계 */}
                                <TableHead className="text-right min-w-28 font-bold">
                                    합계
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {activeMembers.map((member) => (
                                <TableRow key={member.id}>
                                    {/* 회원 이름 (고정 열) */}
                                    <TableCell className="sticky left-0 bg-background font-medium">
                                        {member.name}
                                    </TableCell>

                                    {/* 각 월 납입 여부 */}
                                    {months.map((month) => {
                                        const tx = getTransaction(member.id, month);
                                        return (
                                            <TableCell
                                                key={month}
                                                className={cn(
                                                    "text-center",
                                                    // 미납: 빨간 배경 강조
                                                    !tx && "bg-destructive/10 text-destructive font-medium"
                                                )}
                                            >
                                                {tx ? formatCurrency(tx.amount) : "미납"}
                                            </TableCell>
                                        );
                                    })}

                                    {/* 회원별 연간 합계 */}
                                    <TableCell className="text-right font-semibold">
                                        {formatCurrency(getMemberTotal(member.id))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                        {/* 열 합계 행 */}
                        <TableFooter>
                            <TableRow>
                                <TableCell className="sticky left-0 bg-muted font-bold">
                                    월 합계
                                </TableCell>
                                {months.map((month) => (
                                    <TableCell key={month} className="text-center font-semibold">
                                        {formatCurrency(getMonthTotal(month))}
                                    </TableCell>
                                ))}
                                <TableCell className="text-right font-bold">
                                    {formatCurrency(grandTotal)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            )}

            {/* 색상 범례 */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-destructive/20" />
                    미납
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-background border" />
                    납입 완료
                </div>
            </div>
        </div>
    );
}
