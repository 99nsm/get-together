// app/board/[id]/page.tsx
// 게시글 상세 페이지 (/board/[id])
// 게시글 제목, 작성자, 날짜, 본문, 첨부사진을 보여줍니다.
// Phase 1: 수정/삭제 버튼은 UI만 표시 (기능은 Phase 5에서 구현)

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockPosts } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

// Next.js 16(App Router)에서 params는 비동기 Promise입니다
export default async function BoardDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Mock 데이터에서 해당 ID의 게시글 조회
    const post = mockPosts.find((p) => p.id === id);

    // 게시글이 없으면 404 페이지로 이동
    if (!post) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* ── 뒤로가기 버튼 ── */}
            <Button variant="ghost" size="sm" asChild>
                <Link href="/board">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    목록으로
                </Link>
            </Button>

            {/* ── 게시글 헤더: 제목 + 공지 뱃지 ── */}
            <div className="space-y-3">
                <div className="flex items-start gap-2 flex-wrap">
                    {post.isPinned && (
                        <Badge className="gap-1 mt-0.5 shrink-0">
                            <Pin className="h-3 w-3" />
                            공지
                        </Badge>
                    )}
                    <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>
                </div>

                {/* 작성자 · 날짜 */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{post.authorName}</span>
                        <span className="mx-2">·</span>
                        <span>{formatDate(post.createdAt)}</span>
                    </div>

                    {/* 수정 / 삭제 버튼 (Phase 1: 하드코딩으로 표시, Phase 5에서 본인 글에만 조건부 표시) */}
                    <div className="flex gap-1">
                        {/* 수정: 수정 페이지로 이동 */}
                        <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                            <Link href={`/board/${id}/edit`}>
                                <Pencil className="h-4 w-4 mr-1" />
                                수정
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            삭제
                        </Button>
                    </div>
                </div>
            </div>

            <Separator />

            {/* ── 본문 내용 ── */}
            {/* whitespace-pre-wrap: 줄바꿈(\n)을 그대로 렌더링 */}
            <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                    {post.content}
                </p>
            </div>

            {/* ── 사진 첨부 갤러리 (Phase 1: 사진 없으면 영역 미표시) ── */}
            {post.photos.length > 0 && (
                <div className="space-y-2">
                    <Separator />
                    <p className="text-sm font-medium text-muted-foreground">
                        첨부 사진 {post.photos.length}장
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {post.photos.map((url, idx) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={idx}
                                src={url}
                                alt={`첨부사진 ${idx + 1}`}
                                className="rounded-md object-cover w-full aspect-square bg-muted"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
