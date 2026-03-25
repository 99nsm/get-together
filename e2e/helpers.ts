// e2e/helpers.ts
// 테스트에서 공통으로 사용하는 유틸 함수 모음
// 로그인, 페이지 이동 등 반복되는 동작을 함수로 묶어둡니다.

import { Page } from "@playwright/test";

/** 이름 + 비밀번호로 로그인합니다 */
export async function login(page: Page, name: string, password: string) {
    await page.goto("/login");
    await page.getByLabel("이름").fill(name);
    await page.getByLabel("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();
    // 로그인 성공 → 메인 페이지(/)로 리다이렉트될 때까지 대기
    await page.waitForURL("/");
}

/** 관리자 계정으로 로그인합니다 */
export async function loginAsAdmin(page: Page) {
    await login(page, "정재민", "1234");
}
