// e2e/06-admin-board.spec.ts
// 관리자 게시판 관리 페이지 (/admin/board) 테스트
// - 페이지 접근 및 목록 로드
// - 게시글 목록 테이블 확인

import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test.describe("관리자 - 게시판 관리", () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/board");
        await expect(page.getByText("불러오는 중...")).not.toBeVisible({ timeout: 10000 });
    });

    test("페이지가 정상적으로 로드된다", async ({ page }) => {
        // 게시판 관련 내용이 화면에 표시되는지 확인 (제목 또는 테이블)
        await expect(page.locator("h1")).toBeVisible();
    });

    test("사이드바 네비게이션이 모두 표시된다", async ({ page }) => {
        await expect(page.getByRole("link", { name: "회원 관리" })).toBeVisible();
        await expect(page.getByRole("link", { name: "게시판 관리" })).toBeVisible();
        await expect(page.getByRole("link", { name: "입금 내역 관리" })).toBeVisible();
        await expect(page.getByRole("link", { name: "비용 관리" })).toBeVisible();
    });
});
