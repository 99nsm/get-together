// app/api/posts/route.ts
// 게시글 목록 조회(GET)와 게시글 작성(POST) API
// GET: 모든 사용자, POST: 로그인 사용자만
// 이미지 업로드는 Vercel Blob 클라우드 저장소를 사용합니다 (Vercel 파일시스템은 읽기 전용이라 직접 저장 불가)

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPosts, createPost } from "@/lib/notion-api";
import { put } from "@vercel/blob";

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
        // FormData로 전송된 데이터 파싱
        const formData = await req.formData();
        const title   = formData.get("title") as string;
        const content = formData.get("content") as string;
        const files   = formData.getAll("photos") as File[];

        if (!title || !content) {
            return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
        }

        // 이미지 파일을 Vercel Blob 클라우드에 업로드하고 URL 목록 생성
        // Vercel 서버는 파일시스템이 읽기 전용이라 로컬 저장 불가 → 클라우드 사용
        const photoUrls: string[] = [];

        for (const file of files) {
            if (!file || file.size === 0) continue;
            const ext      = file.name.split(".").pop() ?? "jpg";
            const filename = `posts/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            try {
                // Vercel Blob에 파일 업로드 (access: "public"으로 누구나 볼 수 있게 설정)
                const blob = await put(filename, file, { access: "public" });
                photoUrls.push(blob.url);
            } catch (blobError) {
                console.error("[POST /api/posts] Blob 업로드 실패:", blobError);
                return NextResponse.json({ error: "이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
            }
        }

        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        const post = await createPost({
            title,
            content,
            authorId:   session.user.id ?? "",
            authorName: session.user.name ?? "",
            createdAt:  today,
            photos:     photoUrls,
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("[POST /api/posts]", error);
        return NextResponse.json({ error: "게시글 작성에 실패했습니다." }, { status: 500 });
    }
}
