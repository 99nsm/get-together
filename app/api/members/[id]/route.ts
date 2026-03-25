// app/api/members/[id]/route.ts
// 특정 회원의 수정(PUT)과 삭제(DELETE)를 처리하는 API
// 모두 관리자만 사용할 수 있습니다.

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateMember, deleteMember } from "@/lib/notion-api";
import bcrypt from "bcryptjs";

// PUT /api/members/[id] — 회원 정보 수정 (관리자 전용)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session?.user as any)?.isAdmin) {
        return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { name, phone, joinDate, isActive, isAdmin, password } = body;

        // 비밀번호가 새로 입력된 경우에만 해시 처리
        let passwordHash: string | undefined;
        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        }

        const member = await updateMember(id, {
            name, phone, joinDate, isActive, isAdmin, passwordHash,
        });

        return NextResponse.json(member);
    } catch (error) {
        console.error("[PUT /api/members]", error);
        return NextResponse.json({ error: "회원 수정에 실패했습니다." }, { status: 500 });
    }
}

// DELETE /api/members/[id] — 회원 삭제 (관리자 전용)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session?.user as any)?.isAdmin) {
        return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });
    }

    try {
        const { id } = await params;
        await deleteMember(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/members]", error);
        return NextResponse.json({ error: "회원 삭제에 실패했습니다." }, { status: 500 });
    }
}
