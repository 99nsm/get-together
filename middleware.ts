// middleware.ts
// 접근 제어 미들웨어 — 모든 요청에서 페이지 접근 권한을 확인합니다.
// Next.js가 페이지를 렌더링하기 전에 이 코드가 먼저 실행됩니다.

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl, auth: session } = req;
    const isLoggedIn = !!session?.user;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAdmin = (session?.user as any)?.isAdmin === true;

    // 관리자 페이지: 관리자만 접근 가능
    if (nextUrl.pathname.startsWith("/admin")) {
        if (!isLoggedIn || !isAdmin) {
            return NextResponse.redirect(new URL("/login", nextUrl));
        }
    }

    // 게시글 작성/수정 페이지: 로그인 사용자만 접근 가능
    if (
        nextUrl.pathname === "/board/write" ||
        nextUrl.pathname.match(/^\/board\/[^/]+\/edit$/)
    ) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", nextUrl));
        }
    }

    return NextResponse.next();
});

// 미들웨어가 실행될 경로 지정 (정적 파일 등 제외)
export const config = {
    matcher: [
        "/admin/:path*",
        "/board/write",
        "/board/:id/edit",
    ],
};
