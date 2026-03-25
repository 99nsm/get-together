// app/board/[id]/_components/PostActions.tsx
// 게시글 수정/삭제 버튼 모음 (Client Component)
// 삭제 시 확인 Dialog를 띄우고, 확인하면 API를 호출해 게시글을 삭제합니다.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Props {
    postId: string;
}

export default function PostActions({ postId }: Props) {
    const router = useRouter();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // 삭제 API 호출 후 목록 페이지로 이동
    async function handleDelete() {
        setLoading(true);
        await fetch(`/api/posts/${postId}`, { method: "DELETE" });
        setLoading(false);
        setIsDeleteOpen(false);
        router.push("/board");
        router.refresh();
    }

    return (
        <div className="flex gap-1">
            {/* 수정 버튼: 수정 페이지로 이동 */}
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link href={`/board/${postId}/edit`}>
                    <Pencil className="h-4 w-4 mr-1" />
                    수정
                </Link>
            </Button>

            {/* 삭제 버튼: 확인 Dialog 열기 */}
            <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setIsDeleteOpen(true)}
            >
                <Trash2 className="h-4 w-4 mr-1" />
                삭제
            </Button>

            {/* 삭제 확인 Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>게시글 삭제</DialogTitle>
                        <DialogDescription>
                            이 게시글을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            취소
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading ? "삭제 중..." : "삭제"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
