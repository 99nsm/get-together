// app/api/expenses/[id]/route.ts
// 특정 지출의 수정(PUT)과 삭제(DELETE) — 관리자 전용

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateExpense, deleteExpense } from "@/lib/notion-api";
import type { ExpenseCategory } from "@/lib/types";

// PUT /api/expenses/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session?.user as any)?.isAdmin) {
        return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const expense = await updateExpense(id, {
            title:       body.title,
            amount:      body.amount,
            category:    body.category as ExpenseCategory,
            usedAt:      body.usedAt,
            description: body.description,
        });
        return NextResponse.json(expense);
    } catch (error) {
        console.error("[PUT /api/expenses]", error);
        return NextResponse.json({ error: "지출 수정에 실패했습니다." }, { status: 500 });
    }
}

// DELETE /api/expenses/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session?.user as any)?.isAdmin) {
        return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });
    }

    try {
        const { id } = await params;
        await deleteExpense(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/expenses]", error);
        return NextResponse.json({ error: "지출 삭제에 실패했습니다." }, { status: 500 });
    }
}
