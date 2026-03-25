// app/board/page.tsx
// 게시판 목록 페이지 (/board)
// 서버 컴포넌트: Notion DB에서 게시글을 가져와 표시합니다.
// ?cursor=xxx URL 파라미터로 다음 페이지 조회 (Notion 커서 기반 페이지네이션)
// dynamic = 'force-dynamic': 요청 시마다 최신 게시글을 가져옵니다.
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Pin, PenLine, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPosts } from "@/lib/notion-api";
import { formatDate } from "@/lib/utils";

export default async function BoardPage({
    searchParams,
}: {
    // Next.js App Router에서 searchParams는 비동기 Promise입니다
    searchParams: Promise<{ cursor?: string }>;
}) {
    const { cursor } = await searchParams;

    // Notion에서 게시글 목록과 다음 페이지 커서를 가져옴
    const { posts, nextCursor } = await getPosts(cursor);

    return (
        <div className="space-y-6">
            {/* ── 헤더: 제목 + 글쓰기 버튼 ── */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">게시판</h1>
                <Button asChild size="sm">
                    <Link href="/board/write">
                        <PenLine className="h-4 w-4 mr-1" />
                        글쓰기
                    </Link>
                </Button>
            </div>

            {/* ── 게시글 목록 ── */}
            {posts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p className="font-medium">작성된 게시글이 없습니다</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {posts.map((post) => (
                        <Link key={post.id} href={`/board/${post.id}`}>
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardContent className="py-4 px-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            {/* 제목 + 공지 뱃지 */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {post.isPinned && (
                                                    <Badge className="shrink-0 gap-1">
                                                        <Pin className="h-3 w-3" />
                                                        공지
                                                    </Badge>
                                                )}
                                                <p className="font-semibold truncate">{post.title}</p>
                                            </div>
                                            {/* 본문 미리보기 */}
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {post.content}
                                            </p>
                                            {/* 작성자 · 날짜 · 사진 수 */}
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                <span>{post.authorName}</span>
                                                <span>·</span>
                                                <span>{formatDate(post.createdAt)}</span>
                                                {post.photos.length > 0 && (
                                                    <>
                                                        <span>·</span>
                                                        <span className="flex items-center gap-0.5">
                                                            <ImageIcon className="h-3 w-3" />
                                                            {post.photos.length}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* ── 페이지네이션: Notion 커서 기반 ── */}
            <div className="flex justify-center items-center gap-2 pt-2">
                {/* 이전 페이지: 커서가 있으면 처음으로 돌아가는 버튼 표시 */}
                {cursor ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/board">처음으로</Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>이전</Button>
                )}

                {/* 다음 페이지: Notion이 nextCursor를 줬을 때만 활성화 */}
                {nextCursor ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/board?cursor=${nextCursor}`}>다음</Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>다음</Button>
                )}
            </div>
        </div>
    );
}
