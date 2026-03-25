// app/admin/board/page.tsx
// 관리자 게시판 관리 페이지 (/admin/board)
// API를 통해 전체 게시글 조회, 공지 고정 토글, 삭제를 처리합니다.

"use client";

import { useState, useEffect, useCallback } from "react";
import { Pin, PinOff, Trash2 } from "lucide-react";
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
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // API에서 게시글 목록 조회 (첫 페이지)
    const fetchPosts = useCallback(async () => {
        const res = await fetch("/api/posts");
        const data = await res.json();
        // getPosts는 { posts, nextCursor } 형태를 반환
        setPosts(data.posts ?? []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // 공지 핀 토글: PUT /api/posts/[id]
    async function togglePin(post: Post) {
        await fetch(`/api/posts/${post.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPinned: !post.isPinned }),
        });
        fetchPosts();
    }

    // 게시글 삭제: DELETE /api/posts/[id]
    async function handleDelete() {
        const res = await fetch(`/api/posts/${deleteTargetId}`, { method: "DELETE" });
        if (!res.ok) {
            alert("삭제에 실패했습니다.");
            return;
        }
        setDeleteTargetId(null);
        fetchPosts();
    }

    const deleteTarget = posts.find((p) => p.id === deleteTargetId);

    // 공지글이 상단에 오도록 정렬
    const sortedPosts = [...posts].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">게시판 관리</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    총 {posts.length}개 게시글 (공지: {posts.filter((p) => p.isPinned).length}개)
                </p>
            </div>

            {loading ? (
                <p className="text-center py-16 text-muted-foreground">불러오는 중...</p>
            ) : (
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
                                    <TableCell
                                        className={`font-medium ${post.isPinned ? "text-primary" : ""}`}
                                    >
                                        {post.title}
                                    </TableCell>
                                    <TableCell>{post.authorName}</TableCell>
                                    <TableCell>{formatDate(post.createdAt)}</TableCell>
                                    <TableCell>
                                        <Badge variant={post.isPinned ? "default" : "outline"}>
                                            {post.isPinned ? "공지" : "일반"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* 공지 핀 토글 버튼 */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => togglePin(post)}
                                                title={post.isPinned ? "공지 해제" : "공지로 고정"}
                                            >
                                                {post.isPinned ? (
                                                    <PinOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Pin className="h-4 w-4" />
                                                )}
                                            </Button>
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
            )}

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
                        <Button variant="outline" onClick={() => setDeleteTargetId(null)}>취소</Button>
                        <Button variant="destructive" onClick={handleDelete}>삭제</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
