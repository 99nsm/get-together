// app/api/expenses/route.ts
// 지출 목록 조회(GET)와 지출 등록(POST) API
// GET: 모든 사용자, POST: 관리자 전용

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getExpenses, createExpense } from "@/lib/notion-api";
import type { ExpenseCategory } from "@/lib/types";

// GET /api/expenses?category=식비 — 지출 목록 조회 (카테고리 필터 선택)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category") ?? undefined;

        const expenses = await getExpenses(category);
        return NextResponse.json(expenses);
    } catch (error) {
        console.error("[GET /api/expenses]", error);
        return NextResponse.json({ error: "지출 목록을 불러오지 못했습니다." }, { status: 500 });
    }
}

// POST /api/expenses — 지출 등록 (관리자 전용)
export async function POST(req: Request) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session?.user as any)?.isAdmin) {
        return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { title, amount, category, usedAt, description } = body;

        if (!title || !amount || !category || !usedAt) {
            return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
        }

        const expense = await createExpense({
            title,
            amount,
            category: category as ExpenseCategory,
            usedAt,
            description: description ?? "",
        });

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        console.error("[POST /api/expenses]", error);
        return NextResponse.json({ error: "지출 등록에 실패했습니다." }, { status: 500 });
    }
}
