// e2e/02-main.spec.ts
// 메인 페이지(/) 테스트
// - 대시보드 요약 카드 표시 확인
// - 회원 납입 현황 목록 표시 확인

import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test.describe("메인 페이지 (대시보드)", () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test("총 모인 금액 카드가 표시된다", async ({ page }) => {
        await expect(page.getByText("총 모인 금액")).toBeVisible();
    });

    test("이달 납입률 카드가 표시된다", async ({ page }) => {
        await expect(page.getByText("이달 납입률")).toBeVisible();
    });

    test("회원 납입 현황 섹션이 표시된다", async ({ page }) => {
        await expect(page.getByRole("heading", { name: "회원 납입 현황" })).toBeVisible();
    });
});
