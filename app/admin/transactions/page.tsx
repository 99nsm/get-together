// app/admin/transactions/page.tsx
// 관리자 입금 내역 관리 페이지 (/admin/transactions)
// 입금 내역 조회, 등록, 수정, 삭제, 일괄 등록 UI를 제공합니다.
// Phase 2: Mock 데이터 기반 UI 구현 (실제 API는 Phase 5에서 연결)

"use client";

import { useState } from "react";
import { Plus, ListPlus, Pencil, Trash2 } from "lucide-react";
import { mockTransactions, mockMembers } from "@/lib/mock-data";
import type { Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// 활성 회원 목록 (회원 선택 Select에 사용)
const activeMembers = mockMembers.filter((m) => m.isActive);

// 입금 내역에서 연도 목록 추출 (중복 제거, 내림차순)
const availableYears = [...new Set(mockTransactions.map((tx) => tx.year))].sort(
    (a, b) => b - a
);

// 빈 폼 초기값
const emptyForm = {
    memberId: "",
    year: String(new Date().getFullYear()),
    month: "",
    amount: "",
    paidAt: "",
};

// 일괄 등록 폼 초기값
const emptyBulkForm = {
    year: String(new Date().getFullYear()),
    month: "",
    amount: "",
    selectedMemberIds: [] as string[],
};

export default function AdminTransactionsPage() {
    // 입금 내역 목록 상태 (Mock 데이터로 초기화)
    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

    // 연도 필터
    const [selectedYear, setSelectedYear] = useState<string>(
        String(availableYears[0] ?? new Date().getFullYear())
    );

    // 월 필터 ("all"이면 전체 월 표시)
    const [selectedMonth, setSelectedMonth] = useState<string>("all");

    // 추가 Dialog 열림 여부
    const [isAddOpen, setIsAddOpen] = useState(false);

    // 수정 중인 입금 내역 (null이면 닫힘)
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    // 삭제 대상 ID (null이면 닫힘)
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // 일괄 등록 Dialog 열림 여부
    const [isBulkOpen, setIsBulkOpen] = useState(false);

    // 추가/수정 폼 상태
    const [form, setForm] = useState(emptyForm);

    // 일괄 등록 폼 상태
    const [bulkForm, setBulkForm] = useState(emptyBulkForm);

    // ── 필터링된 목록 (연도 + 월 조건) ──────────────────────────
    const filteredTx = transactions.filter((tx) => {
        const yearMatch = tx.year === Number(selectedYear);
        const monthMatch = selectedMonth === "all" || tx.month === Number(selectedMonth);
        return yearMatch && monthMatch;
    });

    // ── 이벤트 핸들러 ──────────────────────────

    // 추가 Dialog 열기
    function openAdd() {
        setForm(emptyForm);
        setIsAddOpen(true);
    }

    // 수정 Dialog 열기
    function openEdit(tx: Transaction) {
        setForm({
            memberId: tx.memberId,
            year: String(tx.year),
            month: String(tx.month),
            amount: String(tx.amount),
            paidAt: tx.paidAt,
        });
        setEditingTx(tx);
    }

    // 입금 내역 추가 처리
    function handleAdd() {
        const member = activeMembers.find((m) => m.id === form.memberId);
        if (!member) return;

        const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            memberId: form.memberId,
            memberName: member.name,
            year: Number(form.year),
            month: Number(form.month),
            amount: Number(form.amount),
            paidAt: form.paidAt,
        };
        setTransactions((prev) => [...prev, newTx]);
        setIsAddOpen(false);
    }

    // 입금 내역 수정 처리
    function handleEdit() {
        if (!editingTx) return;
        const member = activeMembers.find((m) => m.id === form.memberId);
        if (!member) return;

        setTransactions((prev) =>
            prev.map((tx) =>
                tx.id === editingTx.id
                    ? {
                          ...tx,
                          memberId: form.memberId,
                          memberName: member.name,
                          year: Number(form.year),
                          month: Number(form.month),
                          amount: Number(form.amount),
                          paidAt: form.paidAt,
                      }
                    : tx
            )
        );
        setEditingTx(null);
    }

    // 입금 내역 삭제 처리
    function handleDelete() {
        setTransactions((prev) => prev.filter((tx) => tx.id !== deleteTargetId));
        setDeleteTargetId(null);
    }

    // 일괄 등록 처리 (선택된 회원들에 대해 동일 월/금액으로 등록)
    function handleBulkAdd() {
        const newTxList: Transaction[] = bulkForm.selectedMemberIds
            .map((memberId) => {
                const member = activeMembers.find((m) => m.id === memberId);
                if (!member) return null;
                return {
                    id: `tx-${Date.now()}-${memberId}`,
                    memberId,
                    memberName: member.name,
                    year: Number(bulkForm.year),
                    month: Number(bulkForm.month),
                    amount: Number(bulkForm.amount),
                    paidAt: "",
                } satisfies Transaction;
            })
            .filter((tx): tx is Transaction => tx !== null);

        setTransactions((prev) => [...prev, ...newTxList]);
        setIsBulkOpen(false);
        setBulkForm(emptyBulkForm);
    }

    // 일괄 등록 회원 체크박스 토글
    function toggleBulkMember(memberId: string) {
        setBulkForm((f) => ({
            ...f,
            selectedMemberIds: f.selectedMemberIds.includes(memberId)
                ? f.selectedMemberIds.filter((id) => id !== memberId)
                : [...f.selectedMemberIds, memberId],
        }));
    }

    // 삭제 대상 입금 내역
    const deleteTarget = transactions.find((tx) => tx.id === deleteTargetId);

    // 폼 유효성 검사 (추가/수정 공통)
    const isFormValid =
        form.memberId && form.year && form.month && form.amount && form.paidAt;

    return (
        <div className="space-y-6">
            {/* 페이지 제목 + 버튼 영역 */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">입금 내역 관리</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {selectedYear}년 {selectedMonth === "all" ? "전체" : `${selectedMonth}월`} 입금 내역 {filteredTx.length}건
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsBulkOpen(true)}>
                        <ListPlus className="mr-2 h-4 w-4" />
                        일괄 등록
                    </Button>
                    <Button onClick={openAdd}>
                        <Plus className="mr-2 h-4 w-4" />
                        등록
                    </Button>
                </div>
            </div>

            {/* 연도 + 월 필터 */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Label>연도</Label>
                    <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); setSelectedMonth("all"); }}>
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
                </div>
                <div className="flex items-center gap-2">
                    <Label>월</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-28">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <SelectItem key={m} value={String(m)}>
                                    {m}월
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 입금 내역 테이블 */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>회원명</TableHead>
                            <TableHead>연도</TableHead>
                            <TableHead>월</TableHead>
                            <TableHead>금액</TableHead>
                            <TableHead>납입일</TableHead>
                            <TableHead className="text-right">액션</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTx.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="py-10 text-center text-muted-foreground"
                                >
                                    {selectedYear}년 입금 내역이 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTx.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-medium">{tx.memberName}</TableCell>
                                    <TableCell>{tx.year}년</TableCell>
                                    <TableCell>{tx.month}월</TableCell>
                                    <TableCell>{formatCurrency(tx.amount)}</TableCell>
                                    <TableCell>{formatDate(tx.paidAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(tx)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteTargetId(tx.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── 등록 Dialog ── */}
            <Dialog open={isAddOpen} onOpenChange={(open) => !open && setIsAddOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>입금 내역 등록</DialogTitle>
                        <DialogDescription>새 입금 내역을 입력하세요.</DialogDescription>
                    </DialogHeader>
                    <TransactionForm form={form} setForm={setForm} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                            취소
                        </Button>
                        <Button onClick={handleAdd} disabled={!isFormValid}>
                            등록
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── 수정 Dialog ── */}
            <Dialog
                open={editingTx !== null}
                onOpenChange={(open) => !open && setEditingTx(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>입금 내역 수정</DialogTitle>
                        <DialogDescription>입금 내역을 수정하세요.</DialogDescription>
                    </DialogHeader>
                    <TransactionForm form={form} setForm={setForm} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingTx(null)}>
                            취소
                        </Button>
                        <Button onClick={handleEdit} disabled={!isFormValid}>
                            저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── 삭제 확인 Dialog ── */}
            <Dialog
                open={deleteTargetId !== null}
                onOpenChange={(open) => !open && setDeleteTargetId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>입금 내역 삭제</DialogTitle>
                        <DialogDescription>
                            <span className="font-semibold">{deleteTarget?.memberName}</span>의{" "}
                            {deleteTarget?.year}년 {deleteTarget?.month}월 입금 내역을 정말
                            삭제하시겠습니까?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                            취소
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            삭제
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── 일괄 등록 Dialog ── */}
            <Dialog
                open={isBulkOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsBulkOpen(false);
                        setBulkForm(emptyBulkForm);
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>일괄 등록</DialogTitle>
                        <DialogDescription>
                            특정 월에 여러 회원의 입금을 한 번에 등록합니다.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        {/* 연도 / 월 */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label>연도</Label>
                                <Input
                                    type="number"
                                    value={bulkForm.year}
                                    onChange={(e) =>
                                        setBulkForm((f) => ({ ...f, year: e.target.value }))
                                    }
                                    placeholder="2026"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>월</Label>
                                <Select
                                    value={bulkForm.month}
                                    onValueChange={(v) =>
                                        setBulkForm((f) => ({ ...f, month: v }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="월 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                            <SelectItem key={m} value={String(m)}>
                                                {m}월
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 금액 */}
                        <div className="grid gap-1.5">
                            <Label>금액 (원)</Label>
                            <Input
                                type="number"
                                value={bulkForm.amount}
                                onChange={(e) =>
                                    setBulkForm((f) => ({ ...f, amount: e.target.value }))
                                }
                                placeholder="50000"
                            />
                        </div>

                        {/* 회원 선택 체크박스 목록 */}
                        <div className="grid gap-1.5">
                            <Label>납입 회원 선택</Label>
                            <div className="rounded-md border p-3 space-y-2 max-h-48 overflow-y-auto">
                                {activeMembers.map((member) => (
                                    <label
                                        key={member.id}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={bulkForm.selectedMemberIds.includes(member.id)}
                                            onChange={() => toggleBulkMember(member.id)}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-sm">{member.name}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {bulkForm.selectedMemberIds.length}명 선택됨
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsBulkOpen(false);
                                setBulkForm(emptyBulkForm);
                            }}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleBulkAdd}
                            disabled={
                                !bulkForm.year ||
                                !bulkForm.month ||
                                !bulkForm.amount ||
                                bulkForm.selectedMemberIds.length === 0
                            }
                        >
                            {bulkForm.selectedMemberIds.length}명 일괄 등록
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─────────────────────────────────────────
// 등록/수정 공용 폼 컴포넌트
// ─────────────────────────────────────────
interface TransactionFormProps {
    form: typeof emptyForm;
    setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
}

function TransactionForm({ form, setForm }: TransactionFormProps) {
    return (
        <div className="grid gap-4 py-2">
            {/* 회원 선택 */}
            <div className="grid gap-1.5">
                <Label>회원 *</Label>
                <Select
                    value={form.memberId}
                    onValueChange={(v) => setForm((f) => ({ ...f, memberId: v }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="회원 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        {activeMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                                {member.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* 연도 / 월 */}
            <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                    <Label>연도 *</Label>
                    <Input
                        type="number"
                        value={form.year}
                        onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                        placeholder="2026"
                    />
                </div>
                <div className="grid gap-1.5">
                    <Label>월 *</Label>
                    <Select
                        value={form.month}
                        onValueChange={(v) => setForm((f) => ({ ...f, month: v }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="월" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <SelectItem key={m} value={String(m)}>
                                    {m}월
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 금액 */}
            <div className="grid gap-1.5">
                <Label>금액 (원) *</Label>
                <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="50000"
                />
            </div>

            {/* 납입일 */}
            <div className="grid gap-1.5">
                <Label>납입일 *</Label>
                <Input
                    type="date"
                    value={form.paidAt}
                    onChange={(e) => setForm((f) => ({ ...f, paidAt: e.target.value }))}
                />
            </div>
        </div>
    );
}
