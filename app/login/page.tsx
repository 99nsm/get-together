// app/login/page.tsx
// 로그인 페이지 (/login)
// Auth.js Credentials Provider를 사용해 이름+비밀번호로 로그인합니다.

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    const router = useRouter();

    // 폼 입력값 상태
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Auth.js signIn: redirect:false 로 결과를 직접 받음
        const result = await signIn("credentials", {
            name,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError("이름 또는 비밀번호가 올바르지 않습니다.");
        } else {
            // 로그인 성공 → 메인 페이지로 이동 (router.refresh로 세션 갱신)
            router.push("/");
            router.refresh();
        }
    }

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">로그인</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 이름 입력 */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name">이름</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="홍길동"
                                required
                            />
                        </div>

                        {/* 비밀번호 입력 */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호 입력"
                                required
                            />
                        </div>

                        {/* 오류 메시지 */}
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "로그인 중..." : "로그인"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
