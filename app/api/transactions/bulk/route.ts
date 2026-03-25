// app/api/transactions/bulk/route.ts
// 특정 월에 여러 회원의 입금 내역을 한 번에 등록하는 API (관리자 전용)
// 예: 3월 분 회원 5명 입금을 한 번에 처리

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createTransaction } from "@/lib/notion-api";

// POST /api/transactions/bulk
// body: { year, month, paidAt, entries: [{ memberId, memberName, amount }] }
export async function POST(req: Request) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session?.user as any)?.isAdmin) {
        return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { year, month, entries } = body;

        if (!year || !month || !Array.isArray(entries) || entries.length === 0) {
            return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
        }

        // 여러 건을 병렬로 동시에 등록합니다
        const results = await Promise.all(
            entries.map((entry: { memberId: string; memberName: string; amount: number }) =>
                createTransaction({
                    memberId:   entry.memberId,
                    memberName: entry.memberName,
                    year,
                    month,
                    amount:     entry.amount,
                })
            )
        );

        return NextResponse.json(results, { status: 201 });
    } catch (error) {
        console.error("[POST /api/transactions/bulk]", error);
        return NextResponse.json({ error: "일괄 등록에 실패했습니다." }, { status: 500 });
    }
}
