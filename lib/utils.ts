// lib/utils.ts
// shadcn/ui에서 필수로 사용하는 유틸리티 함수 모음
// cn() 함수는 여러 CSS 클래스를 조건부로 합쳐주는 도우미 함수입니다

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 여러 className을 합치되, Tailwind 충돌을 자동으로 해결합니다
// 예: cn("p-4", isActive && "bg-blue-500") → "p-4 bg-blue-500"
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// 숫자를 한국 원화 형식으로 포맷합니다
// 예: formatCurrency(1200000) → "₩1,200,000"
export function formatCurrency(amount: number): string {
    return `₩${amount.toLocaleString("ko-KR")}`;
}

// 날짜 문자열을 "YYYY년 MM월 DD일" 형식으로 포맷합니다
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
