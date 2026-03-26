// app/board/[id]/edit/page.tsx
// 게시글 수정 페이지 (/board/[id]/edit)
// 마운트 시 GET /api/posts/[id]로 기존 데이터를 불러온 뒤,
// 폼 제출 시 PUT /api/posts/[id]로 수정 내용을 저장합니다.
// 기존 사진 삭제 / 새 사진 추가를 모두 지원합니다.

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

    // 텍스트 필드
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // 기존 사진 URL 목록 (서버에서 받아온 것, 삭제하면 이 목록에서 제거)
    const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
    // 새로 추가할 파일 목록 + 미리보기 URL
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 페이지 마운트 시 기존 게시글 데이터 조회
    useEffect(() => {
        fetch(`/api/posts/${id}`)
            .then((r) => r.json())
            .then((post) => {
                if (!post || post.error) {
                    router.push("/board");
                    return;
                }
                setTitle(post.title);
                setContent(post.content);
                setExistingPhotos(post.photos ?? []);
                setLoading(false);
            })
            .catch(() => router.push("/board"));
    }, [id, router]);

    // 기존 사진 삭제 (목록에서 제거, 서버엔 저장 시 반영)
    function removeExisting(index: number) {
        setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
    }

    // 새 파일 선택
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const urls = files.map((f) => URL.createObjectURL(f));
        setNewFiles((prev) => [...prev, ...files]);
        setNewPreviewUrls((prev) => [...prev, ...urls]);
        // input 초기화 (같은 파일 다시 선택 가능하도록)
        e.target.value = "";
    }

    // 새로 추가한 사진 제거
    function removeNew(index: number) {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
        setNewPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }

    // 폼 제출 → PUT /api/posts/[id] 호출 (FormData)
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) { alert("제목을 입력해주세요."); return; }
        if (!content.trim()) { alert("내용을 입력해주세요."); return; }

        setSaving(true);

        // FormData로 전송
        // - keepPhotos: 유지할 기존 사진 URL들
        // - newPhotos: 새로 업로드할 파일들
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        existingPhotos.forEach((url) => formData.append("keepPhotos", url));
        newFiles.forEach((file) => formData.append("newPhotos", file));

        const res = await fetch(`/api/posts/${id}`, {
            method: "PUT",
            body: formData,
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

    if (loading) {
        return <div className="text-center py-16 text-muted-foreground">불러오는 중...</div>;
    }

    // 전체 사진 수 (기존 유지 + 새로 추가)
    const totalPhotos = existingPhotos.length + newFiles.length;

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

                {/* 사진 관리 */}
                <div className="space-y-2">
                    <Label>사진 ({totalPhotos}장)</Label>

                    {/* 숨겨진 파일 입력 */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {/* 사진 추가 버튼 */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImagePlus className="h-4 w-4 mr-1" />
                        사진 추가
                    </Button>

                    {/* 사진 그리드: 기존 사진(파란 테두리) + 새 사진(초록 테두리) */}
                    {totalPhotos > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {/* 기존 사진 — X 누르면 목록에서 제거 */}
                            {existingPhotos.map((url, idx) => (
                                <div key={`existing-${idx}`} className="relative group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={url}
                                        alt={`기존 사진 ${idx + 1}`}
                                        className="w-full aspect-square object-cover rounded-md bg-muted ring-2 ring-blue-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExisting(idx)}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}

                            {/* 새로 추가한 사진 — 초록 테두리로 구분 */}
                            {newPreviewUrls.map((url, idx) => (
                                <div key={`new-${idx}`} className="relative group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={url}
                                        alt={`새 사진 ${idx + 1}`}
                                        className="w-full aspect-square object-cover rounded-md bg-muted ring-2 ring-green-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNew(idx)}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 파란 테두리 = 기존 사진, 초록 테두리 = 새로 추가 안내 */}
                    {totalPhotos > 0 && (
                        <p className="text-xs text-muted-foreground">
                            파란 테두리: 기존 사진 &nbsp;|&nbsp; 초록 테두리: 새로 추가한 사진
                        </p>
                    )}
                </div>

                {/* 저장 버튼 */}
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
