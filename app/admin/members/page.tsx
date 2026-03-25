// app/admin/members/page.tsx
// 관리자 회원 관리 페이지 (/admin/members)
// API를 통해 회원 목록 조회, 추가, 수정, 삭제, 활성/비활성 토글을 처리합니다.

"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import type { Member } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// 빈 폼 초기값
const emptyForm = {
    name: "",
    phone: "",
    joinDate: "",
    password: "",
    isActive: true,
    isAdmin: false,
};

export default function AdminMembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    // API에서 회원 목록 조회
    const fetchMembers = useCallback(async () => {
        const res = await fetch("/api/members");
        const data = await res.json();
        setMembers(data);
        setLoading(false);
    }, []);

    // 마운트 시 회원 목록 조회
    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // ── 이벤트 핸들러 ──────────────────────────

    function openAdd() {
        setForm(emptyForm);
        setIsAddOpen(true);
    }

    function openEdit(member: Member) {
        setForm({
            name: member.name,
            phone: member.phone,
            joinDate: member.joinDate,
            password: "",
            isActive: member.isActive,
            isAdmin: member.isAdmin,
        });
        setEditingMember(member);
    }

    // 회원 추가: POST /api/members
    async function handleAdd() {
        const res = await fetch("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (!res.ok) {
            alert("회원 추가에 실패했습니다.");
            return;
        }
        setIsAddOpen(false);
        fetchMembers(); // 목록 갱신
    }

    // 회원 수정: PUT /api/members/[id]
    async function handleEdit() {
        if (!editingMember) return;
        const res = await fetch(`/api/members/${editingMember.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (!res.ok) {
            alert("회원 수정에 실패했습니다.");
            return;
        }
        setEditingMember(null);
        fetchMembers();
    }

    // 회원 삭제: DELETE /api/members/[id]
    async function handleDelete() {
        const res = await fetch(`/api/members/${deleteTargetId}`, { method: "DELETE" });
        if (!res.ok) {
            alert("회원 삭제에 실패했습니다.");
            return;
        }
        setDeleteTargetId(null);
        fetchMembers();
    }

    // 활성/비활성 토글: PUT /api/members/[id] (isActive 반전)
    async function toggleActive(member: Member) {
        await fetch(`/api/members/${member.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...member, password: "", isActive: !member.isActive }),
        });
        fetchMembers();
    }

    const deleteTarget = members.find((m) => m.id === deleteTargetId);

    return (
        <div className="space-y-6">
            {/* 페이지 제목 + 회원 추가 버튼 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">회원 관리</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        총 {members.length}명 (활성: {members.filter((m) => m.isActive).length}명)
                    </p>
                </div>
                <Button onClick={openAdd}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    회원 추가
                </Button>
            </div>

            {/* 회원 목록 테이블 */}
            {loading ? (
                <p className="text-center py-16 text-muted-foreground">불러오는 중...</p>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>이름</TableHead>
                                <TableHead>전화번호</TableHead>
                                <TableHead>가입일</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>권한</TableHead>
                                <TableHead className="text-right">액션</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.phone}</TableCell>
                                    <TableCell>{formatDate(member.joinDate)}</TableCell>

                                    {/* 상태 Badge — 클릭하면 활성/비활성 토글 */}
                                    <TableCell>
                                        <button onClick={() => toggleActive(member)}>
                                            <Badge
                                                variant={member.isActive ? "default" : "secondary"}
                                                className="cursor-pointer"
                                            >
                                                {member.isActive ? "활성" : "비활성"}
                                            </Badge>
                                        </button>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant={member.isAdmin ? "default" : "outline"}>
                                            {member.isAdmin ? "관리자" : "일반"}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(member)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteTargetId(member.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* ── 회원 추가 Dialog ── */}
            <Dialog open={isAddOpen} onOpenChange={(open) => !open && setIsAddOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>회원 추가</DialogTitle>
                        <DialogDescription>새 회원 정보를 입력하세요.</DialogDescription>
                    </DialogHeader>
                    <MemberForm form={form} setForm={setForm} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>취소</Button>
                        <Button onClick={handleAdd} disabled={!form.name || !form.phone || !form.password}>
                            추가
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── 회원 수정 Dialog ── */}
            <Dialog
                open={editingMember !== null}
                onOpenChange={(open) => !open && setEditingMember(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>회원 수정</DialogTitle>
                        <DialogDescription>회원 정보를 수정하세요.</DialogDescription>
                    </DialogHeader>
                    <MemberForm form={form} setForm={setForm} isEdit />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingMember(null)}>취소</Button>
                        <Button onClick={handleEdit} disabled={!form.name || !form.phone}>저장</Button>
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
                        <DialogTitle>회원 삭제</DialogTitle>
                        <DialogDescription>
                            <span className="font-semibold">{deleteTarget?.name}</span> 회원을
                            정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
// 추가/수정 공용 폼 컴포넌트
// ─────────────────────────────────────────
interface MemberFormProps {
    form: typeof emptyForm;
    setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
    isEdit?: boolean;
}

function MemberForm({ form, setForm, isEdit }: MemberFormProps) {
    return (
        <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
                <Label htmlFor="name">이름 *</Label>
                <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="홍길동"
                />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="phone">전화번호 *</Label>
                <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="010-0000-0000"
                />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="joinDate">가입일</Label>
                <Input
                    id="joinDate"
                    type="date"
                    value={form.joinDate}
                    onChange={(e) => setForm((f) => ({ ...f, joinDate: e.target.value }))}
                />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="password">
                    비밀번호{isEdit && " (변경 시에만 입력)"}
                </Label>
                <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder={isEdit ? "변경하지 않으면 비워두세요" : "비밀번호 입력"}
                />
            </div>
            <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                        className="h-4 w-4"
                    />
                    <span className="text-sm">활성 회원</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={form.isAdmin}
                        onChange={(e) => setForm((f) => ({ ...f, isAdmin: e.target.checked }))}
                        className="h-4 w-4"
                    />
                    <span className="text-sm">관리자 권한</span>
                </label>
            </div>
        </div>
    );
}
