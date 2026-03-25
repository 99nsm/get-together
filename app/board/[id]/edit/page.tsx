// app/board/[id]/edit/page.tsx
// 게시글 수정 페이지 (/board/[id]/edit)
// 기존 게시글 내용을 폼에 미리 채워서 수정할 수 있게 해줍니다.
// Phase 1: 제출 시 Mock 처리 (실제 저장은 Phase 5에서 구현)

"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockPosts } from "@/lib/mock-data";

export default function BoardEditPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    // Mock 데이터에서 게시글 조회
    const post = mockPosts.find((p) => p.id === id);

    // 폼 상태: 기존 게시글 내용으로 초기화
    const [title, setTitle] = useState(post?.title ?? "");
    const [content, setContent] = useState(post?.content ?? "");
    const [previewUrls, setPreviewUrls] = useState<string[]>(post?.photos ?? []);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 게시글이 없으면 404 처리 (useEffect에서 처리)
    useEffect(() => {
        if (!post) notFound();
    }, [post]);

    if (!post) return null;

    // 새 파일 선택 시 미리보기 추가
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...urls]);
    }

    // 미리보기 이미지 제거
    function removePreview(index: number) {
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }

    // 폼 제출 (Phase 1: Mock 처리)
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }
        if (!content.trim()) {
            alert("내용을 입력해주세요.");
            return;
        }
        // Phase 5에서 실제 PUT /api/posts/[id] 호출로 교체
        alert("게시글이 수정되었습니다! (Phase 1: Mock 처리)");
        router.push(`/board/${id}`);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* ── 뒤로가기 ── */}
            <Button variant="ghost" size="sm" asChild>
                <Link href={`/board/${id}`}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    게시글로
                </Link>
            </Button>

            <h1 className="text-2xl font-bold">게시글 수정</h1>

            {/* ── 수정 폼 (기존 내용이 미리 채워져 있음) ── */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* 제목 */}
                <div className="space-y-1.5">
                    <Label htmlFor="title">제목</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                    />
                </div>

                {/* 내용 */}
                <div className="space-y-1.5">
                    <Label htmlFor="content">내용</Label>
                    <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        className="resize-none"
                    />
                </div>

                {/* 사진 첨부 */}
                <div className="space-y-2">
                    <Label>사진 첨부</Label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImagePlus className="h-4 w-4 mr-1" />
                        사진 추가
                    </Button>

                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className="relative group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={url}
                                        alt={`미리보기 ${idx + 1}`}
                                        className="w-full aspect-square object-cover rounded-md bg-muted"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePreview(idx)}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 버튼 */}
                <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        취소
                    </Button>
                    <Button type="submit">저장</Button>
                </div>
            </form>
        </div>
    );
}
