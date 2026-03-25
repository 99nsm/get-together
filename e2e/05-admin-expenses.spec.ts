// e2e/05-admin-expenses.spec.ts
// 관리자 비용 관리 페이지 (/admin/expenses) 테스트
// - 페이지 접근 및 목록 로드
// - 카테고리 필터 동작
// - 비용 등록 → 수정 → 삭제 전체 흐름 (CRUD)

import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test.describe("관리자 - 비용 관리", () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/expenses");
        await expect(page.getByText("불러오는 중...")).toHaveCount(0, { timeout: 10000 });
    });

    test("페이지 제목이 표시된다", async ({ page }) => {
        await expect(page.getByRole("heading", { name: "비용 관리" })).toBeVisible();
    });

    test("테이블 헤더가 표시된다", async ({ page }) => {
        await expect(page.getByRole("columnheader", { name: "항목" })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: "카테고리" })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: "날짜" })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: "금액" })).toBeVisible();
    });

    test("등록 다이얼로그가 열리고 닫힌다", async ({ page }) => {
        await page.getByRole("button", { name: "등록" }).click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("heading", { name: "비용 등록" })).toBeVisible();

        // Label에 htmlFor가 없어 getByLabel 대신 getByPlaceholder 사용
        await expect(page.getByPlaceholder("예: 3월 회식")).toBeVisible();
        await expect(page.getByPlaceholder("50000")).toBeVisible();

        await page.getByRole("button", { name: "취소" }).click();
        await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    test("비용 등록 → 수정 → 삭제 전체 CRUD 흐름", async ({ page }) => {
        test.setTimeout(60_000); // API 요청 포함하므로 60초로 늘림

        // 매 실행마다 유니크한 이름 사용 (이전 실패로 남은 데이터와 충돌 방지)
        const uid = Date.now();
        const testTitle = `E2E-테스트-${uid}`;
        const editedTitle = `E2E-수정됨-${uid}`;

        // ── 1. 등록 ──
        await page.getByRole("button", { name: "등록" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();

        await page.getByPlaceholder("예: 3월 회식").fill(testTitle);
        // 카테고리 선택
        await page.getByRole("dialog").getByRole("combobox").click();
        await page.getByRole("option", { name: "기타" }).click();
        // 날짜
        await page.getByRole("dialog").locator('input[type="date"]').fill("2026-03-25");
        // 금액
        await page.getByPlaceholder("50000").fill("9999");

        await page.getByRole("button", { name: "등록" }).click();
        // Notion API 응답이 느릴 수 있어 15초 대기
        await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 15000 });

        // 등록된 항목이 테이블에 표시되는지 확인
        await expect(page.getByRole("cell", { name: testTitle, exact: true })).toBeVisible({ timeout: 15000 });

        // ── 2. 수정 ──
        const targetRow = page.getByRole("row", { name: new RegExp(testTitle) });
        await targetRow.getByRole("button").first().click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("heading", { name: "비용 수정" })).toBeVisible();

        // 항목명 수정
        await page.getByPlaceholder("예: 3월 회식").clear();
        await page.getByPlaceholder("예: 3월 회식").fill(editedTitle);

        await page.getByRole("button", { name: "저장" }).click();
        // Notion API 응답이 느릴 수 있어 15초 대기
        await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 15000 });

        // 수정된 이름이 테이블에 표시되는지 확인
        await expect(page.getByRole("cell", { name: editedTitle, exact: true })).toBeVisible({ timeout: 15000 });

        // ── 3. 삭제 ──
        const updatedRow = page.getByRole("row", { name: new RegExp(editedTitle) });
        await updatedRow.getByRole("button").last().click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("heading", { name: "비용 삭제" })).toBeVisible();
        // 다이얼로그 안에서만 텍스트 확인
        await expect(page.getByRole("dialog").getByText(editedTitle)).toBeVisible();

        // 삭제 확정
        await page.getByRole("button", { name: "삭제" }).click();
        // Notion API 응답이 느릴 수 있어 15초 대기
        await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 15000 });

        // 삭제 후 테이블에서 사라졌는지 확인
        await expect(page.getByRole("cell", { name: editedTitle, exact: true })).not.toBeVisible({ timeout: 15000 });
    });

    test("카테고리 필터로 목록이 바뀐다", async ({ page }) => {
        // 카테고리 Select 클릭
        await page.getByRole("combobox").click();
        await page.getByRole("option", { name: "식비" }).click();

        // 필터 적용 후 로딩 완료 대기
        await expect(page.getByText("불러오는 중...")).toHaveCount(0, { timeout: 10000 });

        // "전체" 텍스트가 "식비"로 바뀌었는지 확인
        await expect(page.getByText("식비 지출 내역")).toBeVisible();
    });
});
