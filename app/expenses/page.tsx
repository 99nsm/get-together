// app/expenses/page.tsx
// 비용 사용 내역 페이지 (/expenses)
// 지출 목록을 카테고리별로 필터링하고, 항목 클릭 시 상세 정보를 모달로 보여줍니다.
// Phase 1: "use client"로 필터·모달 상태 관리, Mock 데이터 사용

"use client";

import { useState } from "react";
import { Receipt, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { mockExpenses } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Expense, ExpenseCategory } from "@/lib/types";

// 카테고리 탭 목록
const CATEGORIES = ["전체", "식비", "활동비", "경조사비", "기타"] as const;
type TabValue = (typeof CATEGORIES)[number];

// 카테고리별 색상 뱃지 스타일
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
    식비: "bg-orange-100 text-orange-700 border-orange-200",
    활동비: "bg-blue-100 text-blue-700 border-blue-200",
    경조사비: "bg-pink-100 text-pink-700 border-pink-200",
    기타: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function ExpensesPage() {
    // 선택된 카테고리 탭
    const [activeTab, setActiveTab] = useState<TabValue>("전체");
    // 상세 모달에 표시할 지출 항목 (null이면 모달 닫힘)
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    // 카테고리 필터 적용
    const filteredExpenses =
        activeTab === "전체"
            ? mockExpenses
            : mockExpenses.filter((e) => e.category === activeTab);

    // 필터된 항목들의 합계
    const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    // 전체 합계
    const grandTotal = mockExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6">
            {/* ── 헤더 ── */}
            <h1 className="text-2xl font-bold">비용 사용 내역</h1>

            {/* ── 총 지출 합계 위젯 ── */}
            <Card>
                <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Receipt className="h-5 w-5" />
                        <span className="text-sm font-medium">전체 지출 합계</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(grandTotal)}</p>
                </CardContent>
            </Card>

            {/* ── 카테고리 필터 탭 ── */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
                <TabsList className="w-full sm:w-auto">
                    {CATEGORIES.map((cat) => (
                        <TabsTrigger key={cat} value={cat} className="flex-1 sm:flex-none">
                            {cat}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* ── 필터 결과 요약 ── */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{filteredExpenses.length}건</span>
                <span className="font-medium text-foreground">
                    소계: {formatCurrency(filteredTotal)}
                </span>
            </div>

            {/* ── 지출 목록 카드 ── */}
            {filteredExpenses.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p>해당 카테고리의 지출 내역이 없습니다</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredExpenses.map((expense) => (
                        <Card
                            key={expense.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setSelectedExpense(expense)}
                        >
                            <CardContent className="py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* 항목명 */}
                                        <p className="font-semibold truncate">{expense.title}</p>
                                        {/* 날짜 + 카테고리 뱃지 */}
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(expense.usedAt)}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${CATEGORY_COLORS[expense.category]}`}
                                            >
                                                {expense.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    {/* 금액 */}
                                    <p className="font-bold text-lg shrink-0">
                                        {formatCurrency(expense.amount)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ── 지출 상세 모달 ── */}
            <Dialog
                open={selectedExpense !== null}
                onOpenChange={(open) => !open && setSelectedExpense(null)}
            >
                {selectedExpense && (
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>{selectedExpense.title}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-3 text-sm">
                            {/* 카테고리 뱃지 */}
                            <Badge
                                variant="outline"
                                className={CATEGORY_COLORS[selectedExpense.category]}
                            >
                                {selectedExpense.category}
                            </Badge>

                            <Separator />

                            {/* 상세 정보 목록 */}
                            <div className="space-y-2">
                                <Row label="금액" value={formatCurrency(selectedExpense.amount)} bold />
                                <Row label="날짜" value={formatDate(selectedExpense.usedAt)} />
                                {selectedExpense.description && (
                                    <Row label="설명" value={selectedExpense.description} />
                                )}
                            </div>

                            {/* 첨부 사진 (Phase 5에서 실제 이미지로 대체) */}
                            {selectedExpense.photos.length > 0 && (
                                <>
                                    <Separator />
                                    <p className="text-muted-foreground text-xs">
                                        첨부 사진 {selectedExpense.photos.length}장
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedExpense.photos.map((url, idx) => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                key={idx}
                                                src={url}
                                                alt={`사진 ${idx + 1}`}
                                                className="rounded-md object-cover w-full aspect-square bg-muted"
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}

// 상세 정보 한 줄을 표시하는 작은 컴포넌트
function Row({
    label,
    value,
    bold,
}: {
    label: string;
    value: string;
    bold?: boolean;
}) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className={bold ? "font-bold" : ""}>{value}</span>
        </div>
    );
}
