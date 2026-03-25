// e2e/07-expenses-public.spec.ts
// 일반 사용자 지출 내역 페이지 (/expenses) 테스트
// - 로그인 후 지출 목록 조회

import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test.describe("지출 내역 페이지", () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/expenses");
    });

    test("지출 내역 페이지가 정상적으로 로드된다", async ({ page }) => {
        // 로딩 중 텍스트가 사라지거나 내용이 표시될 때까지 대기
        await page.waitForLoadState("networkidle");
        // 페이지 자체가 에러 없이 렌더링되는지 확인
        await expect(page.locator("body")).not.toContainText("500");
        await expect(page.locator("body")).not.toContainText("Error");
    });
});
