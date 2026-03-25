// e2e/04-admin-transactions.spec.ts
// 관리자 입금 내역 관리 페이지 (/admin/transactions) 테스트
// - 페이지 접근 및 목록 로드
// - 연도/월 필터 동작
// - 등록/수정/삭제/일괄등록 다이얼로그 열기·닫기

import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test.describe("관리자 - 입금 내역 관리", () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/transactions");
        await expect(page.getByText("불러오는 중...")).toHaveCount(0, { timeout: 10000 });
    });

    test("페이지 제목이 표시된다", async ({ page }) => {
        await expect(page.getByRole("heading", { name: "입금 내역 관리" })).toBeVisible();
    });

    test("테이블 헤더가 표시된다", async ({ page }) => {
        await expect(page.getByRole("columnheader", { name: "회원명" })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: "금액" })).toBeVisible();
    });

    test("연도 필터 Select가 동작한다", async ({ page }) => {
        const yearSelect = page.locator("text=연도").locator("..").getByRole("combobox");
        await expect(yearSelect).toBeVisible();
    });

    test("등록 다이얼로그가 열리고 닫힌다", async ({ page }) => {
        // exact: true 로 "일괄 등록" 버튼과 구분
        await page.getByRole("button", { name: "등록", exact: true }).click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("heading", { name: "입금 내역 등록" })).toBeVisible();

        await page.getByRole("button", { name: "취소" }).click();
        await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    test("일괄 등록 다이얼로그가 열리고 닫힌다", async ({ page }) => {
        await page.getByRole("button", { name: "일괄 등록" }).click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("heading", { name: "일괄 등록" })).toBeVisible();

        await page.getByRole("button", { name: "취소" }).click();
        await expect(page.getByRole("dialog")).not.toBeVisible();
    });
});
