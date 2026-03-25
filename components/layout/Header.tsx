"use client";
// components/layout/Header.tsx
// 모든 페이지 상단에 표시되는 네비게이션 바입니다.
// 로고, 메뉴 링크, 로그인 버튼을 포함합니다.
// Phase 0: UI만 구현 (로그인 기능은 Phase 3에서 연결)

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

// 네비게이션 메뉴 항목 목록
const navItems = [
    { href: "/", label: "메인" },
    { href: "/board", label: "게시판" },
    { href: "/transactions", label: "이체내역" },
    { href: "/expenses", label: "비용" },
];

export default function Header() {
    const pathname = usePathname();
    // 모바일 메뉴 열림/닫힘 상태
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-screen-lg items-center justify-between px-4">
                {/* 로고 */}
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                    <PiggyBank className="h-5 w-5 text-primary" />
                    <span>반성</span>
                </Link>

                {/* 데스크톱 메뉴 */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                // 현재 페이지는 강조 표시
                                pathname === item.href
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* 우측: 로그인 버튼 + 모바일 햄버거 */}
                <div className="flex items-center gap-2">
                    {/* 로그인 버튼 (Phase 3에서 실제 기능 연결) */}
                    <Link
                        href="/login"
                        className="hidden md:inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        로그인
                    </Link>

                    {/* 모바일 햄버거 버튼 */}
                    <button
                        className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-accent"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="메뉴 열기"
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* 모바일 드롭다운 메뉴 */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-background px-4 py-3 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
                    >
                        로그인
                    </Link>
                </div>
            )}
        </header>
    );
}
