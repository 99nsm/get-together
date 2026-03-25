// app/api/posts/route.ts
// 게시글 목록 조회(GET)와 게시글 작성(POST) API
// GET: 모든 사용자, POST: 로그인 사용자만

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPosts, createPost } from "@/lib/notion-api";

// GET /api/posts?cursor=xxx — 게시글 목록 조회 (페이지네이션)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get("cursor") ?? undefined;

        const result = await getPosts(cursor);
        return NextResponse.json(result);
    } catch (error) {
        console.error("[GET /api/posts]", error);
        return NextResponse.json({ error: "게시글 목록을 불러오지 못했습니다." }, { status: 500 });
    }
}

// POST /api/posts — 게시글 작성 (로그인 사용자 전용)
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, content } = body;

        if (!title || !content) {
            return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
        }

        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        const post = await createPost({
            title,
            content,
            authorId:   session.user.id ?? "",
            authorName: session.user.name ?? "",
            createdAt:  today,
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("[POST /api/posts]", error);
        return NextResponse.json({ error: "게시글 작성에 실패했습니다." }, { status: 500 });
    }
}
