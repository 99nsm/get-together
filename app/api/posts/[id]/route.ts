// app/api/posts/[id]/route.ts
// 게시글 상세 조회(GET), 수정(PUT), 삭제(DELETE) API
// GET: 모든 사용자
// PUT/DELETE: 본인 작성 글 또는 관리자
// PUT은 FormData로 받아 새 이미지를 Vercel Blob에 업로드합니다.

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPost, updatePost, deletePost } from "@/lib/notion-api";
import { put } from "@vercel/blob";

// GET /api/posts/[id] — 게시글 상세 조회
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const post = await getPost(id);
        if (!post) {
            return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }
        return NextResponse.json(post);
    } catch (error) {
        console.error("[GET /api/posts/[id]]", error);
        return NextResponse.json({ error: "게시글을 불러오지 못했습니다." }, { status: 500 });
    }
}

// PUT /api/posts/[id] — 게시글 수정 (본인 또는 관리자)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const { id } = await params;

        // 본인 글인지 확인 (관리자는 모든 글 수정 가능)
        const existing = await getPost(id);
        if (!existing) {
            return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isAdmin = (session.user as any)?.isAdmin === true;
        const isAuthor = existing.authorId === session.user.id;

        if (!isAdmin && !isAuthor) {
            return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });
        }

        // FormData로 수신 (새 사진 파일 포함 가능)
        const formData = await req.formData();
        const title   = formData.get("title") as string | null;
        const content = formData.get("content") as string | null;
        const isPinned = formData.get("isPinned");

        // 기존 사진 중 유지할 URL 목록 (클라이언트가 남길 것만 보냄)
        const keepUrls = formData.getAll("keepPhotos") as string[];
        // 새로 추가할 파일 목록
        const newFiles = formData.getAll("newPhotos") as File[];

        // 새 파일을 Vercel Blob에 업로드
        const uploadedUrls: string[] = [];
        for (const file of newFiles) {
            if (!file || file.size === 0) continue;
            const ext      = file.name.split(".").pop() ?? "jpg";
            const filename = `posts/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            try {
                const blob = await put(filename, file, { access: "public" });
                uploadedUrls.push(blob.url);
            } catch (blobError) {
                console.error("[PUT /api/posts/[id]] Blob 업로드 실패:", blobError);
                return NextResponse.json({ error: "이미지 업로드에 실패했습니다." }, { status: 500 });
            }
        }

        // 최종 사진 URL = 유지할 기존 사진 + 새로 업로드한 사진
        const finalPhotos = [...keepUrls, ...uploadedUrls];

        const post = await updatePost(id, {
            title:    title ?? undefined,
            content:  content ?? undefined,
            photos:   finalPhotos,
            // 공지 고정은 관리자만 변경 가능
            isPinned: isAdmin && isPinned !== null ? isPinned === "true" : undefined,
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("[PUT /api/posts/[id]]", error);
        return NextResponse.json({ error: "게시글 수정에 실패했습니다." }, { status: 500 });
    }
}

// DELETE /api/posts/[id] — 게시글 삭제 (본인 또는 관리자)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const { id } = await params;

        const existing = await getPost(id);
        if (!existing) {
            return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isAdmin = (session.user as any)?.isAdmin === true;
        const isAuthor = existing.authorId === session.user.id;

        if (!isAdmin && !isAuthor) {
            return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
        }

        await deletePost(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/posts/[id]]", error);
        return NextResponse.json({ error: "게시글 삭제에 실패했습니다." }, { status: 500 });
    }
}
