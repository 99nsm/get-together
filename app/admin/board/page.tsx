// app/admin/board/page.tsx
// 관리자 게시판 관리 페이지 (/admin/board)
// 전체 게시글 목록 조회, 공지 고정 토글, 삭제 기능을 제공합니다.
// Phase 2: Mock 데이터 기반 UI 구현 (실제 API는 Phase 5에서 연결)

"use client";

import { useState } from "react";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { mockPosts } from "@/lib/mock-data";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function AdminBoardPage() {
    // 게시글 목록 상태 (Mock 데이터로 초기화)
    const [posts, setPosts] = useState<Post[]>(mockPosts);

    // 삭제 대상 게시글 ID (null이면 Dialog 닫힘)
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // ── 이벤트 핸들러 ──────────────────────────

    // 공지 핀 고정 토글
    function togglePin(postId: string) {
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId ? { ...p, isPinned: !p.isPinned } : p
            )
        );
    }

    // 게시글 삭제 처리
    function handleDelete() {
        setPosts((prev) => prev.filter((p) => p.id !== deleteTargetId));
        setDeleteTargetId(null);
    }

    // 삭제 대상 게시글 (확인 Dialog에 제목 표시용)
    const deleteTarget = posts.find((p) => p.id === deleteTargetId);

    // 공지글이 상단에 오도록 정렬 (pinned → 일반 순)
    const sortedPosts = [...posts].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
    });

    return (
        <div className="space-y-6">
            {/* 페이지 제목 */}
            <div>
                <h1 className="text-2xl font-bold">게시판 관리</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    총 {posts.length}개 게시글 (공지: {posts.filter((p) => p.isPinned).length}개)
                </p>
            </div>

            {/* 게시글 목록 테이블 */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>제목</TableHead>
                            <TableHead>작성자</TableHead>
                            <TableHead>작성일</TableHead>
                            <TableHead>공지</TableHead>
                            <TableHead className="text-right">액션</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedPosts.map((post) => (
                            <TableRow key={post.id}>
                                {/* 제목 (공지글은 배경 강조) */}
                                <TableCell
                                    className={`font-medium ${post.isPinned ? "text-primary" : ""}`}
                                >
                                    {post.title}
                                </TableCell>
                                <TableCell>{post.authorName}</TableCell>
                                <TableCell>{formatDate(post.createdAt)}</TableCell>

                                {/* 공지 여부 Badge */}
                                <TableCell>
                                    <Badge variant={post.isPinned ? "default" : "outline"}>
                                        {post.isPinned ? "공지" : "일반"}
                                    </Badge>
                                </TableCell>

                                {/* 핀 토글 · 삭제 버튼 */}
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* 핀 고정 토글 버튼 */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => togglePin(post.id)}
                                            title={post.isPinned ? "공지 해제" : "공지로 고정"}
                                        >
                                            {post.isPinned ? (
                                                <PinOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Pin className="h-4 w-4" />
                                            )}
                                        </Button>

                                        {/* 삭제 버튼 */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteTargetId(post.id)}
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

            {/* ── 삭제 확인 Dialog ── */}
            <Dialog
                open={deleteTargetId !== null}
                onOpenChange={(open) => !open && setDeleteTargetId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>게시글 삭제</DialogTitle>
                        <DialogDescription>
                            <span className="font-semibold">"{deleteTarget?.title}"</span> 게시글을
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
