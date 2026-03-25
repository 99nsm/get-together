// playwright.config.ts
// Playwright E2E 테스트 설정 파일
// 로컬 개발 서버(http://localhost:3000)를 대상으로 테스트를 실행합니다.

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    // 테스트 파일 위치
    testDir: "./e2e",

    // 테스트 결과 리포트 형식
    reporter: "list",

    // 각 테스트의 최대 실행 시간 (30초)
    timeout: 30_000,

    // 병렬 실행 워커 수 제한 (Next.js 개발 서버 부하 방지)
    workers: 2,

    // 네트워크 오류 등 일시적인 실패 시 1회 재시도
    retries: 1,

    use: {
        // 테스트 대상 서버 주소
        baseURL: "http://localhost:3000",

        // 테스트 실패 시 스크린샷 저장
        screenshot: "only-on-failure",

        // 브라우저를 화면에 띄울지 여부 (true = 눈에 보이게 실행)
        headless: false,
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
});
