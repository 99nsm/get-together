// app/api/auth/[...nextauth]/route.ts
// Auth.js v5 핸들러 연결 파일
// /api/auth/* 경로의 모든 요청(로그인, 로그아웃, 세션 조회 등)을 처리합니다.

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
