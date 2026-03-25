// app/board/[id]/page.tsx
// 게시글 상세 페이지 (/board/[id])
// 서버 컴포넌트: Notion DB에서 게시글을 가져와 표시합니다.
// 본인 글이거나 관리자일 때만 수정/삭제 버튼을 표시합니다.
// dynamic = 'force-dynamic': 세션 정보를 포함하므로 요청 시마다 렌더링합니다.
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getPost } from "@/lib/notion-api";
import { auth } from "@/auth";
import { formatDate } from "@/lib/utils";
import PostActions from "./_components/PostActions";

export default async function BoardDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Notion DB에서 게시글 조회
    const post = await getPost(id);
    if (!post) notFound();

    // 현재 로그인 세션 확인 (수정/삭제 버튼 표시 여부 판단)
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAdmin = (session?.user as any)?.isAdmin === true;
    const isAuthor = post.authorId === session?.user?.id;
    // 본인 글이거나 관리자인 경우에만 수정/삭제 가능
    const canModify = isAdmin || isAuthor;

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

                {/* 작성자 · 날짜 · 수정/삭제 버튼 */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{post.authorName}</span>
                        <span className="mx-2">·</span>
                        <span>{formatDate(post.createdAt)}</span>
                    </div>

                    {/* 본인 글 또는 관리자만 수정/삭제 버튼 표시 */}
                    {canModify && <PostActions postId={id} />}
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

            {/* ── 사진 첨부 갤러리 ── */}
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
