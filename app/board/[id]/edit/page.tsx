// app/board/[id]/edit/page.tsx
// 게시글 수정 페이지 (/board/[id]/edit)
// 마운트 시 GET /api/posts/[id]로 기존 데이터를 불러온 뒤,
// 폼 제출 시 PUT /api/posts/[id]로 수정 내용을 저장합니다.

"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function BoardEditPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    // 로딩/저장 상태
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 폼 입력값 상태 (API 응답으로 초기화)
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 페이지 마운트 시 기존 게시글 데이터 조회
    useEffect(() => {
        fetch(`/api/posts/${id}`)
            .then((r) => r.json())
            .then((post) => {
                if (!post || post.error) {
                    // 게시글이 없으면 목록으로 이동
                    router.push("/board");
                    return;
                }
                setTitle(post.title);
                setContent(post.content);
                setPreviewUrls(post.photos ?? []);
                setLoading(false);
            })
            .catch(() => router.push("/board"));
    }, [id, router]);

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

    // 폼 제출 → PUT /api/posts/[id] 호출
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }
        if (!content.trim()) {
            alert("내용을 입력해주세요.");
            return;
        }

        setSaving(true);
        const res = await fetch(`/api/posts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content }),
        });
        setSaving(false);

        if (!res.ok) {
            const data = await res.json();
            alert(data.error ?? "게시글 수정에 실패했습니다.");
            return;
        }

        // 수정 성공 → 게시글 상세 페이지로 이동
        router.push(`/board/${id}`);
        router.refresh();
    }

    // 게시글 로딩 중 표시
    if (loading) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                불러오는 중...
            </div>
        );
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

            {/* ── 수정 폼 ── */}
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
                    <Button type="submit" disabled={saving}>
                        {saving ? "저장 중..." : "저장"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
