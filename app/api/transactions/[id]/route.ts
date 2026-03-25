// app/api/transactions/[id]/route.ts
// 특정 입금 내역의 수정(PUT)과 삭제(DELETE) — 관리자 전용

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateTransaction, deleteTransaction } from "@/lib/notion-api";

// PUT /api/transactions/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session?.user as any)?.isAdmin) {
        return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const transaction = await updateTransaction(id, {
            year:   body.year,
            month:  body.month,
            amount: body.amount,
        });
        return NextResponse.json(transaction);
    } catch (error) {
        console.error("[PUT /api/transactions]", error);
        return NextResponse.json({ error: "입금 내역 수정에 실패했습니다." }, { status: 500 });
    }
}

// DELETE /api/transactions/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session?.user as any)?.isAdmin) {
        return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });
    }

    try {
        const { id } = await params;
        await deleteTransaction(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/transactions]", error);
        return NextResponse.json({ error: "입금 내역 삭제에 실패했습니다." }, { status: 500 });
    }
}
