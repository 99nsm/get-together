// app/api/posts/[id]/route.ts
// 게시글 상세 조회(GET), 수정(PUT), 삭제(DELETE) API
// GET: 모든 사용자
// PUT/DELETE: 본인 작성 글 또는 관리자

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPost, updatePost, deletePost } from "@/lib/notion-api";

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

        const body = await req.json();
        const post = await updatePost(id, {
            title:    body.title,
            content:  body.content,
            // 공지 고정은 관리자만 변경 가능
            isPinned: isAdmin ? body.isPinned : undefined,
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
