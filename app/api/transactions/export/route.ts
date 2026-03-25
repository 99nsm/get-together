// app/api/transactions/export/route.ts
// 입금 내역을 엑셀 파일(.xlsx)로 내보내는 API
// 회원(행) × 월(열) 형태의 표를 생성합니다.

import { NextResponse } from "next/server";
import { getTransactions, getMembers } from "@/lib/notion-api";
import * as XLSX from "xlsx";

// GET /api/transactions/export?year=2026
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const year = searchParams.get("year") ? Number(searchParams.get("year")) : new Date().getFullYear();

        // 해당 연도의 모든 입금 내역과 활성 회원 목록을 가져옵니다
        const [transactions, members] = await Promise.all([
            getTransactions(year),
            getMembers(),
        ]);

        const activeMembers = members.filter((m) => m.isActive);

        // 엑셀 헤더: 이름, 1월, 2월, ..., 12월, 합계
        const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
        const headers = ["이름", ...months, "합계"];

        // 각 회원별로 월별 납입 금액을 채웁니다
        const rows = activeMembers.map((member) => {
            const row: (string | number)[] = [member.name];
            let total = 0;

            for (let m = 1; m <= 12; m++) {
                const tx = transactions.find(
                    (t) => t.memberId === member.id && t.month === m
                );
                const amount = tx?.amount ?? 0;
                row.push(amount > 0 ? amount : "미납");
                total += amount;
            }

            row.push(total);
            return row;
        });

        // 워크시트 생성
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `${year}년 입금 현황`);

        // 엑셀 파일을 바이너리 버퍼로 변환
        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="transactions_${year}.xlsx"`,
            },
        });
    } catch (error) {
        console.error("[GET /api/transactions/export]", error);
        return NextResponse.json({ error: "엑셀 내보내기에 실패했습니다." }, { status: 500 });
    }
}
