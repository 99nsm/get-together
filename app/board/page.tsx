// app/board/page.tsx
// 게시판 목록 페이지 (/board)
// 공지 고정 게시글을 상단에 표시하고, 나머지 게시글을 최신순으로 카드 형태로 보여줍니다.

import Link from "next/link";
import { Pin, PenLine, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockPosts } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function BoardPage() {
    // 공지(isPinned) 먼저, 그 다음 최신순 정렬
    const sortedPosts = [...mockPosts].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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
            {sortedPosts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p className="font-medium">작성된 게시글이 없습니다</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {sortedPosts.map((post) => (
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
                                            {/* 작성자 · 날짜 */}
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                <span>{post.authorName}</span>
                                                <span>·</span>
                                                <span>{formatDate(post.createdAt)}</span>
                                                {/* 사진 첨부 표시 */}
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

            {/* ── 페이지네이션 UI (Phase 1: 정적 표시) ── */}
            <div className="flex justify-center items-center gap-2 pt-2">
                <Button variant="outline" size="sm" disabled>
                    이전
                </Button>
                <span className="text-sm px-2">1 / 1</span>
                <Button variant="outline" size="sm" disabled>
                    다음
                </Button>
            </div>
        </div>
    );
}
