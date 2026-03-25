"use client";
// components/layout/Providers.tsx
// 클라이언트 전용 Provider들을 모아두는 컴포넌트입니다.
// SessionProvider: useSession 훅이 앱 전체에서 동작하도록 세션 컨텍스트를 제공합니다.
// layout.tsx는 서버 컴포넌트라 직접 쓸 수 없어서 이 파일로 분리합니다.

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
