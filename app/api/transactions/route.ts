// app/api/transactions/route.ts
// 입금 내역 조회(GET)와 등록(POST)을 처리하는 API
// GET: 모든 사용자, POST: 관리자 전용

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTransactions, createTransaction } from "@/lib/notion-api";

// GET /api/transactions?year=2026&month=3 — 입금 내역 조회
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        // URL 파라미터로 연도·월 필터 지원 (없으면 전체 조회)
        const year  = searchParams.get("year")  ? Number(searchParams.get("year"))  : undefined;
        const month = searchParams.get("month") ? Number(searchParams.get("month")) : undefined;

        const transactions = await getTransactions(year, month);
        return NextResponse.json(transactions);
    } catch (error) {
        console.error("[GET /api/transactions]", error);
        return NextResponse.json({ error: "입금 내역을 불러오지 못했습니다." }, { status: 500 });
    }
}

// POST /api/transactions — 입금 내역 등록 (관리자 전용)
export async function POST(req: Request) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session?.user as any)?.isAdmin) {
        return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { memberId, memberName, year, month, amount } = body;

        if (!memberId || !memberName || !year || !month || !amount) {
            return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
        }

        const transaction = await createTransaction({ memberId, memberName, year, month, amount });
        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error("[POST /api/transactions]", error);
        return NextResponse.json({ error: "입금 내역 등록에 실패했습니다." }, { status: 500 });
    }
}
