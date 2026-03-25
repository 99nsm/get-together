// app/transactions/page.tsx
// 계좌이체 내역 페이지 (/transactions)
// API로 회원·입금 데이터를 가져와 회원 × 월 테이블로 납입 현황을 보여줍니다.
// 연도 필터, 엑셀 내보내기 기능을 제공합니다.

"use client";

import { useState, useEffect } from "react";
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
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Member, Transaction } from "@/lib/types";

// 현재 연도 기준으로 선택 가능한 연도 목록 (전년 ~ 다음 연도)
const currentYear = new Date().getFullYear();
const availableYears = [currentYear - 1, currentYear, currentYear + 1];

export default function TransactionsPage() {
    // 선택된 연도 (기본값: 현재 연도)
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // API에서 불러온 데이터
    const [members, setMembers] = useState<Member[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // 회원 목록은 한 번만 조회
    useEffect(() => {
        fetch("/api/members")
            .then((r) => r.json())
            .then((data: Member[]) => setMembers(data))
            .catch(() => setMembers([]));
    }, []);

    // 연도가 바뀔 때마다 해당 연도의 입금 내역 재조회
    useEffect(() => {
        setLoading(true);
        fetch(`/api/transactions?year=${selectedYear}`)
            .then((r) => r.json())
            .then((data: Transaction[]) => {
                setTransactions(data);
                setLoading(false);
            })
            .catch(() => {
                setTransactions([]);
                setLoading(false);
            });
    }, [selectedYear]);

    // 활성 회원만 표시
    const activeMembers = members.filter((m) => m.isActive);

    // 이 연도에 입금 기록이 있는 월 목록 (오름차순)
    const months = [...new Set(transactions.map((tx) => tx.month))].sort((a, b) => a - b);

    // 특정 회원·월의 입금 내역 조회 헬퍼
    function getTransaction(memberId: string, month: number) {
        return transactions.find(
            (tx) => tx.memberId === memberId && tx.month === month
        );
    }

    // 회원별 연간 합계
    function getMemberTotal(memberId: string) {
        return transactions
            .filter((tx) => tx.memberId === memberId)
            .reduce((sum, tx) => sum + tx.amount, 0);
    }

    // 월별 합계 (열 합계)
    function getMonthTotal(month: number) {
        return transactions
            .filter((tx) => tx.month === month)
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

                    {/* 엑셀 내보내기: /api/transactions/export?year=X 파일 다운로드 */}
                    <Button variant="outline" size="sm" asChild>
                        <a href={`/api/transactions/export?year=${selectedYear}`} download>
                            <Download className="h-4 w-4 mr-1" />
                            엑셀 내보내기
                        </a>
                    </Button>
                </div>
            </div>

            {/* ── 납입 현황 테이블 ── */}
            {loading ? (
                <p className="text-center py-16 text-muted-foreground">불러오는 중...</p>
            ) : months.length === 0 ? (
                <p className="text-center py-16 text-muted-foreground">
                    {selectedYear}년 입금 내역이 없습니다.
                </p>
            ) : (
                /* 모바일에서 가로 스크롤 가능하도록 overflow-x-auto */
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-background min-w-24">
                                    회원
                                </TableHead>
                                {months.map((month) => (
                                    <TableHead key={month} className="text-center min-w-24">
                                        {month}월
                                    </TableHead>
                                ))}
                                <TableHead className="text-right min-w-28 font-bold">
                                    합계
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {activeMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="sticky left-0 bg-background font-medium">
                                        {member.name}
                                    </TableCell>
                                    {months.map((month) => {
                                        const tx = getTransaction(member.id, month);
                                        return (
                                            <TableCell
                                                key={month}
                                                className={cn(
                                                    "text-center",
                                                    !tx && "bg-destructive/10 text-destructive font-medium"
                                                )}
                                            >
                                                {tx ? formatCurrency(tx.amount) : "미납"}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="text-right font-semibold">
                                        {formatCurrency(getMemberTotal(member.id))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                        {/* 월별 합계 행 */}
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
