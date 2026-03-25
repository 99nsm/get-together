"use client";
// components/layout/AdminSidebar.tsx
// 관리자 페이지(/admin/*)에서만 보이는 사이드 네비게이션입니다.
// 회원 관리, 게시판 관리, 입금 내역 관리 메뉴를 포함합니다.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, CreditCard, LayoutDashboard, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

// 관리자 사이드바 메뉴 항목
const adminNavItems = [
    {
        href: "/admin/members",
        label: "회원 관리",
        icon: Users,
    },
    {
        href: "/admin/board",
        label: "게시판 관리",
        icon: FileText,
    },
    {
        href: "/admin/transactions",
        label: "입금 내역 관리",
        icon: CreditCard,
    },
    {
        href: "/admin/expenses",
        label: "비용 관리",
        icon: Receipt,
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        // 모바일: 아이콘만 보이는 좁은 사이드바 (w-12)
        // 데스크톱(md 이상): 텍스트까지 보이는 넓은 사이드바 (w-56)
        <aside className="w-12 md:w-56 shrink-0 border-r bg-background min-h-[calc(100vh-3.5rem)]">
            {/* 관리자 패널 제목: 모바일에서는 아이콘만 표시 */}
            <div className="flex items-center justify-center md:justify-start gap-2 px-2 md:px-4 py-4 border-b">
                <LayoutDashboard className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="hidden md:inline font-semibold text-sm">관리자 패널</span>
            </div>

            {/* 메뉴 목록 */}
            <nav className="p-1 md:p-2 space-y-1">
                {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            // 모바일: 아이콘만 중앙 정렬, 데스크톱: 아이콘+텍스트 좌측 정렬
                            className={cn(
                                "flex items-center justify-center md:justify-start gap-3 rounded-md px-2 md:px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                            // 모바일에서 메뉴 이름을 툴팁으로 표시
                            title={item.label}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="hidden md:inline">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* 일반 사이트로 돌아가기 */}
            <div className="p-1 md:p-2 mt-2 border-t">
                <Link
                    href="/"
                    className="flex items-center justify-center md:justify-start gap-3 rounded-md px-2 md:px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    title="사이트로 돌아가기"
                >
                    {/* 모바일: ← 화살표만, 데스크톱: 텍스트 전체 표시 */}
                    <span className="md:hidden">←</span>
                    <span className="hidden md:inline">← 사이트로 돌아가기</span>
                </Link>
            </div>
        </aside>
    );
}
