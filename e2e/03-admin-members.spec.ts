// e2e/03-admin-members.spec.ts
// 관리자 회원 관리 페이지 (/admin/members) 테스트
// - 페이지 접근 및 목록 로드
// - 회원 추가 다이얼로그 열기/닫기
// - 회원 수정 다이얼로그 열기/닫기
// - 회원 삭제 다이얼로그 열기/닫기

import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test.describe("관리자 - 회원 관리", () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/members");
        // 테이블 로드 대기 (로딩 텍스트가 사라질 때까지)
        await expect(page.getByText("불러오는 중...")).toHaveCount(0, { timeout: 10000 });
    });

    test("페이지 제목이 표시된다", async ({ page }) => {
        await expect(page.getByRole("heading", { name: "회원 관리" })).toBeVisible();
    });

    test("회원 목록 테이블이 표시된다", async ({ page }) => {
        // 테이블 헤더 확인
        await expect(page.getByRole("columnheader", { name: "이름" })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: "전화번호" })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: "상태" })).toBeVisible();
    });

    test("사이드바에서 비용 관리 메뉴가 보인다", async ({ page }) => {
        await expect(page.getByRole("link", { name: "비용 관리" })).toBeVisible();
    });

    test("회원 추가 다이얼로그가 열리고 닫힌다", async ({ page }) => {
        await page.getByRole("button", { name: "회원 추가" }).click();

        // 다이얼로그 열림 확인
        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("heading", { name: "회원 추가" })).toBeVisible();

        // 필수 입력 필드 확인
        await expect(page.getByLabel("이름 *")).toBeVisible();
        await expect(page.getByLabel("전화번호 *")).toBeVisible();

        // 취소 버튼으로 닫기
        await page.getByRole("button", { name: "취소" }).click();
        await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    test("회원 수정 다이얼로그가 열린다", async ({ page }) => {
        // 첫 번째 회원의 수정(연필) 버튼 클릭
        // 0=상태 토글 버튼, 1=수정 버튼, 2=삭제 버튼
        const firstRow = page.getByRole("row").nth(1);
        await firstRow.getByRole("button").nth(1).click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("heading", { name: "회원 수정" })).toBeVisible();

        // 닫기
        await page.getByRole("button", { name: "취소" }).click();
    });

    test("회원 삭제 확인 다이얼로그가 열린다", async ({ page }) => {
        // 첫 번째 회원의 삭제(휴지통) 버튼 클릭
        const firstRow = page.getByRole("row").nth(1);
        await firstRow.getByRole("button").last().click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("heading", { name: "회원 삭제" })).toBeVisible();

        // 취소로 닫기 (실제 삭제하지 않음)
        await page.getByRole("button", { name: "취소" }).click();
        await expect(page.getByRole("dialog")).not.toBeVisible();
    });
});
