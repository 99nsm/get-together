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
        <aside className="w-56 shrink-0 border-r bg-background min-h-[calc(100vh-3.5rem)]">
            {/* 관리자 패널 제목 */}
            <div className="flex items-center gap-2 px-4 py-4 border-b">
                <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-sm">관리자 패널</span>
            </div>

            {/* 메뉴 목록 */}
            <nav className="p-2 space-y-1">
                {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* 일반 사이트로 돌아가기 */}
            <div className="p-2 mt-2 border-t">
                <Link
                    href="/"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    ← 사이트로 돌아가기
                </Link>
            </div>
        </aside>
    );
}
