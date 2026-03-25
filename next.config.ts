// next.config.ts
// Next.js 서버 설정 파일
// Vercel 배포를 위해 정적 배포(GitHub Pages) 설정을 제거했습니다.
// API Routes를 사용하려면 서버가 필요하기 때문에 Vercel을 사용합니다.

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        // Notion에서 받아오는 외부 이미지 URL을 허용합니다
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.notion.so",
            },
            {
                protocol: "https",
                hostname: "**.notion.com",
            },
        ],
    },
};

export default nextConfig;
