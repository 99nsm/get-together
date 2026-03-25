// app/loading.tsx
// 메인 페이지 로딩 중에 자동으로 표시되는 스켈레톤 UI입니다.
// Next.js는 페이지 데이터를 불러오는 동안 이 파일을 보여줍니다.

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HomeLoading() {
    return (
        <div className="space-y-6">
            {/* 제목 스켈레톤 */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-24" />
            </div>

            {/* 요약 위젯 스켈레톤 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[0, 1].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-9 w-36" />
                            <Skeleton className="h-2 w-full" />
                            <Skeleton className="h-3 w-28" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 회원 카드 그리드 스켈레톤 */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Card key={i}>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex justify-between">
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-5 w-20" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <div className="pt-3 border-t space-y-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-7 w-28" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
