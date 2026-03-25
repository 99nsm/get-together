// app/admin/transactions/page.tsx
// 관리자 입금 내역 관리 페이지 (/admin/transactions)
// API를 통해 입금 내역 조회, 등록, 수정, 삭제, 일괄 등록을 처리합니다.

"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ListPlus, Pencil, Trash2 } from "lucide-react";
import type { Transaction, Member } from "@/lib/types";
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

// 현재 연도 기준 선택 가능한 연도 목록
const currentYear = new Date().getFullYear();
const availableYears = [currentYear - 1, currentYear, currentYear + 1];

// 빈 폼 초기값
const emptyForm = {
    memberId: "",
    year: String(currentYear),
    month: "",
    amount: "",
    paidAt: "",
};

// 일괄 등록 폼 초기값
const emptyBulkForm = {
    year: String(currentYear),
    month: "",
    amount: "",
    selectedMemberIds: [] as string[],
};

export default function AdminTransactionsPage() {
    // API에서 불러온 데이터
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    // 필터
    const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
    const [selectedMonth, setSelectedMonth] = useState<string>("all");

    // Dialog 상태
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [isBulkOpen, setIsBulkOpen] = useState(false);

    // 폼 상태
    const [form, setForm] = useState(emptyForm);
    const [bulkForm, setBulkForm] = useState(emptyBulkForm);

    // 활성 회원 목록 (회원 선택 Select에 사용)
    const activeMembers = members.filter((m) => m.isActive);

    // 회원 목록은 한 번만 조회
    useEffect(() => {
        fetch("/api/members")
            .then((r) => r.json())
            .then((data: Member[]) => setMembers(data))
            .catch(() => setMembers([]));
    }, []);

    // 연도/월이 바뀔 때마다 입금 내역 재조회
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ year: selectedYear });
        if (selectedMonth !== "all") params.set("month", selectedMonth);
        const res = await fetch(`/api/transactions?${params}`);
        const data = await res.json();
        setTransactions(data);
        setLoading(false);
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // ── 이벤트 핸들러 ──────────────────────────

    function openAdd() {
        setForm(emptyForm);
        setIsAddOpen(true);
    }

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

    // 입금 내역 추가: POST /api/transactions
    async function handleAdd() {
        const member = activeMembers.find((m) => m.id === form.memberId);
        if (!member) return;

        const res = await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                memberId: form.memberId,
                memberName: member.name,
                year: Number(form.year),
                month: Number(form.month),
                amount: Number(form.amount),
                paidAt: form.paidAt,
            }),
        });
        if (!res.ok) {
            alert("등록에 실패했습니다.");
            return;
        }
        setIsAddOpen(false);
        fetchTransactions();
    }

    // 입금 내역 수정: PUT /api/transactions/[id]
    async function handleEdit() {
        if (!editingTx) return;
        const res = await fetch(`/api/transactions/${editingTx.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: Number(form.amount),
                paidAt: form.paidAt,
            }),
        });
        if (!res.ok) {
            alert("수정에 실패했습니다.");
            return;
        }
        setEditingTx(null);
        fetchTransactions();
    }

    // 입금 내역 삭제: DELETE /api/transactions/[id]
    async function handleDelete() {
        const res = await fetch(`/api/transactions/${deleteTargetId}`, { method: "DELETE" });
        if (!res.ok) {
            alert("삭제에 실패했습니다.");
            return;
        }
        setDeleteTargetId(null);
        fetchTransactions();
    }

    // 일괄 등록: POST /api/transactions/bulk
    async function handleBulkAdd() {
        const entries = bulkForm.selectedMemberIds.map((memberId) => {
            const member = activeMembers.find((m) => m.id === memberId);
            return {
                memberId,
                memberName: member?.name ?? "",
                year: Number(bulkForm.year),
                month: Number(bulkForm.month),
                amount: Number(bulkForm.amount),
                paidAt: new Date().toISOString().split("T")[0],
            };
        });

        const res = await fetch("/api/transactions/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entries }),
        });
        if (!res.ok) {
            alert("일괄 등록에 실패했습니다.");
            return;
        }
        setIsBulkOpen(false);
        setBulkForm(emptyBulkForm);
        fetchTransactions();
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

    const deleteTarget = transactions.find((tx) => tx.id === deleteTargetId);
    const isFormValid = form.memberId && form.year && form.month && form.amount && form.paidAt;

    return (
        <div className="space-y-6">
            {/* 페이지 제목 + 버튼 */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">입금 내역 관리</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {selectedYear}년 {selectedMonth === "all" ? "전체" : `${selectedMonth}월`} 입금 내역 {transactions.length}건
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
                    <Select
                        value={selectedYear}
                        onValueChange={(v) => { setSelectedYear(v); setSelectedMonth("all"); }}
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
                                <SelectItem key={m} value={String(m)}>{m}월</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 입금 내역 테이블 */}
            {loading ? (
                <p className="text-center py-16 text-muted-foreground">불러오는 중...</p>
            ) : (
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
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                        {selectedYear}년 입금 내역이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx) => (
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
            )}

            {/* ── 등록 Dialog ── */}
            <Dialog open={isAddOpen} onOpenChange={(open) => !open && setIsAddOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>입금 내역 등록</DialogTitle>
                        <DialogDescription>새 입금 내역을 입력하세요.</DialogDescription>
                    </DialogHeader>
                    <TransactionForm form={form} setForm={setForm} activeMembers={activeMembers} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>취소</Button>
                        <Button onClick={handleAdd} disabled={!isFormValid}>등록</Button>
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
                    <TransactionForm form={form} setForm={setForm} activeMembers={activeMembers} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingTx(null)}>취소</Button>
                        <Button onClick={handleEdit} disabled={!isFormValid}>저장</Button>
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
                        <Button variant="outline" onClick={() => setDeleteTargetId(null)}>취소</Button>
                        <Button variant="destructive" onClick={handleDelete}>삭제</Button>
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
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label>연도</Label>
                                <Input
                                    type="number"
                                    value={bulkForm.year}
                                    onChange={(e) => setBulkForm((f) => ({ ...f, year: e.target.value }))}
                                    placeholder="2026"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>월</Label>
                                <Select
                                    value={bulkForm.month}
                                    onValueChange={(v) => setBulkForm((f) => ({ ...f, month: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="월 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                            <SelectItem key={m} value={String(m)}>{m}월</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>금액 (원)</Label>
                            <Input
                                type="number"
                                value={bulkForm.amount}
                                onChange={(e) => setBulkForm((f) => ({ ...f, amount: e.target.value }))}
                                placeholder="50000"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>납입 회원 선택</Label>
                            <div className="rounded-md border p-3 space-y-2 max-h-48 overflow-y-auto">
                                {activeMembers.map((member) => (
                                    <label key={member.id} className="flex items-center gap-2 cursor-pointer">
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
                            onClick={() => { setIsBulkOpen(false); setBulkForm(emptyBulkForm); }}
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
    activeMembers: Member[];
}

function TransactionForm({ form, setForm, activeMembers }: TransactionFormProps) {
    return (
        <div className="grid gap-4 py-2">
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
                                <SelectItem key={m} value={String(m)}>{m}월</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid gap-1.5">
                <Label>금액 (원) *</Label>
                <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="50000"
                />
            </div>
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
