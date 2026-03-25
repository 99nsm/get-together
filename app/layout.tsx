// app/layout.tsx
// 모든 페이지에 공통으로 적용되는 최상위 레이아웃입니다.
// 전역 스타일, 헤더를 포함하고 페이지 내용을 감싸는 역할을 합니다.

import type { Metadata } from "next";
import "@/app/globals.css";
import Header from "@/components/layout/Header";
import Providers from "@/components/layout/Providers";

// 브라우저 탭에 표시되는 사이트 정보
export const metadata: Metadata = {
    title: "반성 - 계모임 관리",
    description: "계모임 회원의 납입 현황 및 지출 내역을 투명하게 관리합니다",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // lang="ko": 스크린리더 등 접근성 도구에 한국어임을 알립니다
        <html lang="ko" suppressHydrationWarning>
            <body>
                {/* Providers: useSession 등 클라이언트 훅이 동작하도록 감쌉니다 */}
                <Providers>
                    <Header />
                    <main className="mx-auto max-w-screen-lg px-4 py-6">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}
