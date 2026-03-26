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
    // 실제 파일 객체 목록 (서버로 전송용)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 파일 선택 시 미리보기 URL 생성 + 파일 객체 저장
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...urls]);
        setSelectedFiles((prev) => [...prev, ...files]);
    }

    // 미리보기 이미지 제거 (파일 객체도 함께 제거)
    function removePreview(index: number) {
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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
        // 이미지 파일을 포함하기 위해 FormData로 전송
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        selectedFiles.forEach((file) => formData.append("photos", file));

        const res = await fetch("/api/posts", {
            method: "POST",
            body: formData, // Content-Type 헤더는 브라우저가 자동으로 설정
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

                    {/* 미리보기 이미지 그리드 — 1장: 전체너비 / 2장 이상: 2열 */}
                    {previewUrls.length > 0 && (
                        <div className={`mt-2 ${previewUrls.length === 1 ? "flex flex-col gap-3" : "grid grid-cols-2 gap-3"}`}>
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className="relative group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={url}
                                        alt={`미리보기 ${idx + 1}`}
                                        className={`w-full object-cover rounded-lg bg-muted ${previewUrls.length === 1 ? "max-h-[480px]" : "aspect-[4/3]"}`}
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
