// app/admin/layout.tsx
// 관리자 페이지 공통 레이아웃입니다.
// 좌측에 관리자 사이드바를 표시하고, 우측에 페이지 내용을 렌더링합니다.
// Phase 3에서 관리자 인증 미들웨어를 추가합니다.

import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // 사이드바 + 콘텐츠 영역을 가로로 나란히 배치
        <div className="flex -mx-4 -my-6 min-h-[calc(100vh-3.5rem)]">
            {/* 왼쪽: 관리자 사이드바 */}
            <AdminSidebar />

            {/* 오른쪽: 페이지 내용 — min-w-0으로 flex 자식이 넘치지 않게 방지 */}
            <div className="flex-1 min-w-0 p-4 md:p-6 overflow-auto">
                {children}
            </div>
        </div>
    );
}
