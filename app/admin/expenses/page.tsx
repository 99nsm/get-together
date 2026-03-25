// app/admin/expenses/page.tsx
// 관리자 비용(지출) 관리 페이지 (/admin/expenses)
// API를 통해 지출 내역 조회, 등록, 수정, 삭제를 처리합니다.

"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

// 선택 가능한 카테고리 목록
const CATEGORIES: ExpenseCategory[] = ["식비", "활동비", "경조사비", "기타"];

// 빈 폼 초기값
const emptyForm = {
    title: "",
    amount: "",
    category: "" as ExpenseCategory | "",
    usedAt: "",
    description: "",
};

export default function AdminExpensesPage() {
    // API에서 불러온 지출 목록
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    // 카테고리 필터 (all = 전체)
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Dialog 상태
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // 폼 상태
    const [form, setForm] = useState(emptyForm);

    // 카테고리 필터가 바뀔 때마다 지출 목록 재조회
    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        const res = await fetch(`/api/expenses?${params}`);
        const data = await res.json();
        setExpenses(data);
        setLoading(false);
    }, [selectedCategory]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    // ── 이벤트 핸들러 ──────────────────────────

    function openAdd() {
        setForm(emptyForm);
        setIsAddOpen(true);
    }

    function openEdit(expense: Expense) {
        setForm({
            title: expense.title,
            amount: String(expense.amount),
            category: expense.category,
            usedAt: expense.usedAt,
            description: expense.description,
        });
        setEditingExpense(expense);
    }

    // 지출 등록: POST /api/expenses
    async function handleAdd() {
        const res = await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: form.title,
                amount: Number(form.amount),
                category: form.category,
                usedAt: form.usedAt,
                description: form.description,
            }),
        });
        if (!res.ok) {
            alert("등록에 실패했습니다.");
            return;
        }
        setIsAddOpen(false);
        fetchExpenses();
    }

    // 지출 수정: PUT /api/expenses/[id]
    async function handleEdit() {
        if (!editingExpense) return;
        const res = await fetch(`/api/expenses/${editingExpense.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: form.title,
                amount: Number(form.amount),
                category: form.category,
                usedAt: form.usedAt,
                description: form.description,
            }),
        });
        if (!res.ok) {
            alert("수정에 실패했습니다.");
            return;
        }
        setEditingExpense(null);
        fetchExpenses();
    }

    // 지출 삭제: DELETE /api/expenses/[id]
    async function handleDelete() {
        const res = await fetch(`/api/expenses/${deleteTargetId}`, { method: "DELETE" });
        if (!res.ok) {
            alert("삭제에 실패했습니다.");
            return;
        }
        setDeleteTargetId(null);
        fetchExpenses();
    }

    const deleteTarget = expenses.find((e) => e.id === deleteTargetId);
    const isFormValid =
        form.title && form.amount && form.category && form.usedAt && Number(form.amount) > 0;

    return (
        <div className="space-y-6">
            {/* 페이지 제목 + 등록 버튼 */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">비용 관리</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {selectedCategory === "all" ? "전체" : selectedCategory} 지출 내역 {expenses.length}건
                    </p>
                </div>
                <Button onClick={openAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    등록
                </Button>
            </div>

            {/* 카테고리 필터 */}
            <div className="flex items-center gap-2">
                <Label>카테고리</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* 지출 목록 테이블 */}
            {loading ? (
                <p className="text-center py-16 text-muted-foreground">불러오는 중...</p>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>항목</TableHead>
                                <TableHead>카테고리</TableHead>
                                <TableHead>날짜</TableHead>
                                <TableHead>금액</TableHead>
                                <TableHead>설명</TableHead>
                                <TableHead className="text-right">액션</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                        지출 내역이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="font-medium">{expense.title}</TableCell>
                                        <TableCell>{expense.category}</TableCell>
                                        <TableCell>{expense.usedAt}</TableCell>
                                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                                        <TableCell className="max-w-48 truncate text-muted-foreground">
                                            {expense.description || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(expense)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteTargetId(expense.id)}
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
                        <DialogTitle>비용 등록</DialogTitle>
                        <DialogDescription>새 지출 내역을 입력하세요.</DialogDescription>
                    </DialogHeader>
                    <ExpenseForm form={form} setForm={setForm} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>취소</Button>
                        <Button onClick={handleAdd} disabled={!isFormValid}>등록</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── 수정 Dialog ── */}
            <Dialog
                open={editingExpense !== null}
                onOpenChange={(open) => !open && setEditingExpense(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>비용 수정</DialogTitle>
                        <DialogDescription>{editingExpense?.title} 내역을 수정하세요.</DialogDescription>
                    </DialogHeader>
                    <ExpenseForm form={form} setForm={setForm} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingExpense(null)}>취소</Button>
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
                        <DialogTitle>비용 삭제</DialogTitle>
                        <DialogDescription>
                            <span className="font-semibold">{deleteTarget?.title}</span>({deleteTarget?.usedAt}) 내역을 정말
                            삭제하시겠습니까?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTargetId(null)}>취소</Button>
                        <Button variant="destructive" onClick={handleDelete}>삭제</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─────────────────────────────────────────
// 등록/수정 공용 폼 컴포넌트
// ─────────────────────────────────────────
interface ExpenseFormProps {
    form: typeof emptyForm;
    setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
}

function ExpenseForm({ form, setForm }: ExpenseFormProps) {
    return (
        <div className="grid gap-4 py-2">
            {/* 항목명 */}
            <div className="grid gap-1.5">
                <Label>항목명 *</Label>
                <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="예: 3월 회식"
                />
            </div>

            {/* 카테고리 + 날짜 */}
            <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                    <Label>카테고리 *</Label>
                    <Select
                        value={form.category}
                        onValueChange={(v) => setForm((f) => ({ ...f, category: v as ExpenseCategory }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-1.5">
                    <Label>날짜 *</Label>
                    <Input
                        type="date"
                        value={form.usedAt}
                        onChange={(e) => setForm((f) => ({ ...f, usedAt: e.target.value }))}
                    />
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

            {/* 설명 (선택) */}
            <div className="grid gap-1.5">
                <Label>설명</Label>
                <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="상세 내용을 입력하세요 (선택)"
                    rows={3}
                />
            </div>
        </div>
    );
}
