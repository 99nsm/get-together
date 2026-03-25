// app/api/members/route.ts
// 회원 목록 조회(GET)와 회원 추가(POST)를 처리하는 API
// POST는 관리자만 사용할 수 있습니다.

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMembers, createMember } from "@/lib/notion-api";
import bcrypt from "bcryptjs";

// GET /api/members — 전체 회원 목록 반환
export async function GET() {
    try {
        const members = await getMembers();
        return NextResponse.json(members);
    } catch (error) {
        console.error("[GET /api/members]", error);
        return NextResponse.json({ error: "회원 목록을 불러오지 못했습니다." }, { status: 500 });
    }
}

// POST /api/members — 새 회원 추가 (관리자 전용)
export async function POST(req: Request) {
    // 로그인 세션 확인
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session?.user as any)?.isAdmin) {
        return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, phone, joinDate, isActive, isAdmin, password } = body;

        if (!name || !phone || !joinDate || !password) {
            return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
        }

        // 비밀번호를 해시값으로 변환 (Notion에 평문 비밀번호를 저장하지 않습니다)
        const passwordHash = await bcrypt.hash(password, 10);

        const member = await createMember({
            name,
            phone,
            joinDate,
            isActive:     isActive ?? true,
            isAdmin:      isAdmin  ?? false,
            passwordHash,
        });

        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        console.error("[POST /api/members]", error);
        return NextResponse.json({ error: "회원 추가에 실패했습니다." }, { status: 500 });
    }
}
