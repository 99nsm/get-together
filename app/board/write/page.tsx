// app/board/write/page.tsx
// 게시글 작성 페이지 (/board/write)
// 제목, 내용 폼을 제공하고 POST /api/posts로 게시글을 저장합니다.

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";

export default function BoardWritePage() {
    const router = useRouter();

    // 폼 입력값 상태
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    // 미리보기용 이미지 URL 목록 (File → ObjectURL 변환)
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 파일 선택 시 미리보기 URL 생성
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...urls]);
    }

    // 미리보기 이미지 제거
    function removePreview(index: number) {
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }

    // 폼 제출 → POST /api/posts 호출
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
        const res = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content }),
        });
        setSaving(false);

        if (!res.ok) {
            const data = await res.json();
            alert(data.error ?? "게시글 작성에 실패했습니다.");
            return;
        }

        // 작성 성공 → 게시판 목록으로 이동
        router.push("/board");
        router.refresh();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* ── 뒤로가기 ── */}
            <Button variant="ghost" size="sm" asChild>
                <Link href="/board">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    목록으로
                </Link>
            </Button>

            <h1 className="text-2xl font-bold">게시글 작성</h1>

            {/* ── 작성 폼 ── */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* 제목 입력 */}
                <div className="space-y-1.5">
                    <Label htmlFor="title">제목</Label>
                    <Input
                        id="title"
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                    />
                </div>

                {/* 내용 입력 */}
                <div className="space-y-1.5">
                    <Label htmlFor="content">내용</Label>
                    <Textarea
                        id="content"
                        placeholder="내용을 입력하세요"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        className="resize-none"
                    />
                </div>

                {/* 사진 첨부 (미리보기만 — 현재 Notion API에서 파일 업로드 미지원) */}
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
                        사진 선택
                    </Button>

                    {/* 미리보기 이미지 그리드 */}
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

                {/* 버튼 영역 */}
                <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        취소
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "등록 중..." : "등록"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
