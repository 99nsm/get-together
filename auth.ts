// auth.ts
// Auth.js v5 (next-auth@beta) 설정 파일
// 로그인 방식: 이름 + 비밀번호로 Notion Members DB에서 검증합니다.
// 세션에 id, name, isAdmin 정보를 포함해서 권한 체크에 사용합니다.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getMemberByName, getMemberPasswordHash } from "@/lib/notion-api";

export const { handlers, auth, signIn, signOut } = NextAuth({
    // 세션을 JWT 방식으로 관리합니다 (별도 DB 불필요)
    session: { strategy: "jwt" },

    providers: [
        Credentials({
            // 로그인 폼 필드 정의
            credentials: {
                name:     { label: "이름",    type: "text" },
                password: { label: "비밀번호", type: "password" },
            },

            // 로그인 검증 로직
            async authorize(credentials) {
                const name     = credentials?.name as string;
                const password = credentials?.password as string;
                if (!name || !password) return null;

                // Notion DB에서 해당 이름의 회원 찾기
                const member = await getMemberByName(name);
                if (!member || !member.isActive) return null;

                // 저장된 비밀번호 해시와 입력 비밀번호 비교
                const hash = await getMemberPasswordHash(member.id);
                const isValid = await bcrypt.compare(password, hash);
                if (!isValid) return null;

                // 로그인 성공: 세션에 저장할 유저 정보 반환
                return {
                    id:      member.id,
                    name:    member.name,
                    // next-auth User 타입에 없는 필드는 any로 우선 처리
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    isAdmin: member.isAdmin as any,
                };
            },
        }),
    ],

    callbacks: {
        // JWT 토큰에 isAdmin 정보 저장
        async jwt({ token, user }) {
            if (user) {
                token.id      = user.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.isAdmin = (user as any).isAdmin;
            }
            return token;
        },

        // 세션 객체에 id, isAdmin 노출
        async session({ session, token }) {
            if (session.user) {
                session.user.id      = token.id as string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).isAdmin = token.isAdmin;
            }
            return session;
        },
    },

    // 로그인 페이지 경로 설정
    pages: {
        signIn: "/login",
    },
});
