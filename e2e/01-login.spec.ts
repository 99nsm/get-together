// e2e/01-login.spec.ts
// 로그인 페이지 테스트
// - 올바른 계정으로 로그인 성공
// - 잘못된 비밀번호로 로그인 실패
// - 로그아웃

import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test.describe("로그인", () => {
    test("올바른 계정으로 로그인하면 메인 페이지로 이동한다", async ({ page }) => {
        await loginAsAdmin(page);
        // 메인 페이지 제목 확인
        await expect(page.getByRole("heading", { name: "계모임 현황" })).toBeVisible();
    });

    test("잘못된 비밀번호 입력 시 에러 메시지가 표시된다", async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("이름").fill("정재민");
        await page.getByLabel("비밀번호").fill("wrong-password");
        await page.getByRole("button", { name: "로그인" }).click();

        // 에러 메시지 표시 확인 (API 응답 대기 포함)
        await expect(
            page.getByText("이름 또는 비밀번호가 올바르지 않습니다.")
        ).toBeVisible({ timeout: 10000 });
    });

    test("로그인하지 않고 관리자 페이지 접근 시 로그인 페이지로 이동한다", async ({ page }) => {
        await page.goto("/admin/members");
        // 미들웨어가 /login으로 리다이렉트
        await expect(page).toHaveURL(/\/login/);
    });
});
