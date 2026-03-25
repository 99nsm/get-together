// app/admin/members/page.tsx
// 관리자 회원 관리 페이지 (/admin/members)
// 회원 목록 조회, 추가, 수정, 삭제, 활성/비활성 토글 UI를 제공합니다.
// Phase 2: Mock 데이터 기반 UI 구현 (실제 API는 Phase 5에서 연결)

"use client";

import { useState } from "react";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import { mockMembers } from "@/lib/mock-data";
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

// ─────────────────────────────────────────
// 빈 폼 초기값 (추가 Dialog 열 때 사용)
// ─────────────────────────────────────────
const emptyForm = {
    name: "",
    phone: "",
    joinDate: "",
    password: "",
    isActive: true,
    isAdmin: false,
};

export default function AdminMembersPage() {
    // 회원 목록 상태 (Mock 데이터로 초기화)
    const [members, setMembers] = useState<Member[]>(mockMembers);

    // 추가 Dialog 열림 여부
    const [isAddOpen, setIsAddOpen] = useState(false);

    // 수정 중인 회원 (null이면 닫힘)
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    // 삭제 대상 회원 ID (null이면 닫힘)
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // 추가/수정 폼 입력값 상태
    const [form, setForm] = useState(emptyForm);

    // ── 이벤트 핸들러 ──────────────────────────

    // 추가 Dialog 열기
    function openAdd() {
        setForm(emptyForm);
        setIsAddOpen(true);
    }

    // 수정 Dialog 열기 (선택한 회원 데이터로 폼 채우기)
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

    // 회원 추가 처리 (Mock: ID를 임시로 생성)
    function handleAdd() {
        const newMember: Member = {
            id: `member-${Date.now()}`,
            name: form.name,
            phone: form.phone,
            joinDate: form.joinDate,
            isActive: form.isActive,
            isAdmin: form.isAdmin,
        };
        setMembers((prev) => [...prev, newMember]);
        setIsAddOpen(false);
    }

    // 회원 수정 처리
    function handleEdit() {
        if (!editingMember) return;
        setMembers((prev) =>
            prev.map((m) =>
                m.id === editingMember.id
                    ? {
                          ...m,
                          name: form.name,
                          phone: form.phone,
                          joinDate: form.joinDate,
                          isActive: form.isActive,
                          isAdmin: form.isAdmin,
                      }
                    : m
            )
        );
        setEditingMember(null);
    }

    // 회원 삭제 처리
    function handleDelete() {
        setMembers((prev) => prev.filter((m) => m.id !== deleteTargetId));
        setDeleteTargetId(null);
    }

    // 활성/비활성 토글 (상태 Badge 클릭 시)
    function toggleActive(memberId: string) {
        setMembers((prev) =>
            prev.map((m) =>
                m.id === memberId ? { ...m, isActive: !m.isActive } : m
            )
        );
    }

    // 삭제 대상 회원 이름 (확인 Dialog에 표시)
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
                                    <button onClick={() => toggleActive(member.id)}>
                                        <Badge
                                            variant={member.isActive ? "default" : "secondary"}
                                            className="cursor-pointer"
                                        >
                                            {member.isActive ? "활성" : "비활성"}
                                        </Badge>
                                    </button>
                                </TableCell>

                                {/* 권한 Badge */}
                                <TableCell>
                                    <Badge variant={member.isAdmin ? "default" : "outline"}>
                                        {member.isAdmin ? "관리자" : "일반"}
                                    </Badge>
                                </TableCell>

                                {/* 수정·삭제 버튼 */}
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

            {/* ── 회원 추가 Dialog ── */}
            <Dialog open={isAddOpen} onOpenChange={(open) => !open && setIsAddOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>회원 추가</DialogTitle>
                        <DialogDescription>새 회원 정보를 입력하세요.</DialogDescription>
                    </DialogHeader>
                    <MemberForm form={form} setForm={setForm} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                            취소
                        </Button>
                        <Button onClick={handleAdd} disabled={!form.name || !form.phone}>
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
                        <Button variant="outline" onClick={() => setEditingMember(null)}>
                            취소
                        </Button>
                        <Button onClick={handleEdit} disabled={!form.name || !form.phone}>
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
                        <DialogTitle>회원 삭제</DialogTitle>
                        <DialogDescription>
                            <span className="font-semibold">{deleteTarget?.name}</span> 회원을
                            정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
        </div>
    );
}

// ─────────────────────────────────────────
// 추가/수정 공용 폼 컴포넌트
// ─────────────────────────────────────────
interface MemberFormProps {
    form: typeof emptyForm;
    setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
    isEdit?: boolean;  // true이면 비밀번호 필드를 "변경 시에만 입력" 안내로 표시
}

function MemberForm({ form, setForm, isEdit }: MemberFormProps) {
    return (
        <div className="grid gap-4 py-2">
            {/* 이름 */}
            <div className="grid gap-1.5">
                <Label htmlFor="name">이름 *</Label>
                <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="홍길동"
                />
            </div>

            {/* 전화번호 */}
            <div className="grid gap-1.5">
                <Label htmlFor="phone">전화번호 *</Label>
                <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="010-0000-0000"
                />
            </div>

            {/* 가입일 */}
            <div className="grid gap-1.5">
                <Label htmlFor="joinDate">가입일</Label>
                <Input
                    id="joinDate"
                    type="date"
                    value={form.joinDate}
                    onChange={(e) => setForm((f) => ({ ...f, joinDate: e.target.value }))}
                />
            </div>

            {/* 비밀번호 */}
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

            {/* 체크박스: 활성 여부, 관리자 여부 */}
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
