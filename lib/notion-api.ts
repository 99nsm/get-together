// lib/notion-api.ts
// Notion DB와 실제로 통신하는 함수 모음
// 각 DB(회원, 입금, 지출, 게시글)에 대해 조회/생성/수정/삭제 기능을 제공합니다.
// 서버 사이드(API Routes)에서만 사용해야 합니다.

import { notion, DB_IDS } from "@/lib/notion";
import type { Member, Transaction, Expense, ExpenseCategory, Post } from "@/lib/types";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

// ─────────────────────────────────────────────────────────────
// 유틸: Notion 응답에서 특정 속성 값을 꺼내는 헬퍼 함수들
// Notion API 응답 형태가 복잡해서 이 함수들로 간단하게 추출합니다
// ─────────────────────────────────────────────────────────────

function getText(page: PageObjectResponse, key: string): string {
    const prop = page.properties[key];
    if (!prop) return "";
    if (prop.type === "title") return prop.title[0]?.plain_text ?? "";
    if (prop.type === "rich_text") return prop.rich_text[0]?.plain_text ?? "";
    return "";
}

function getNumber(page: PageObjectResponse, key: string): number {
    const prop = page.properties[key];
    if (prop?.type === "number") return prop.number ?? 0;
    return 0;
}

function getCheckbox(page: PageObjectResponse, key: string): boolean {
    const prop = page.properties[key];
    if (prop?.type === "checkbox") return prop.checkbox;
    return false;
}

function getSelect(page: PageObjectResponse, key: string): string {
    const prop = page.properties[key];
    if (prop?.type === "select") return prop.select?.name ?? "";
    return "";
}

function getDate(page: PageObjectResponse, key: string): string {
    const prop = page.properties[key];
    if (prop?.type === "date") return prop.date?.start ?? "";
    return "";
}

function getFiles(page: PageObjectResponse, key: string): string[] {
    const prop = page.properties[key];
    if (prop?.type !== "files") return [];
    return prop.files.map((f) => {
        if (f.type === "file") return f.file.url;
        if (f.type === "external") return f.external.url;
        return "";
    }).filter(Boolean);
}

function getRelationId(page: PageObjectResponse, key: string): string {
    const prop = page.properties[key];
    if (prop?.type === "relation") return prop.relation[0]?.id ?? "";
    return "";
}

// ─────────────────────────────────────────────────────────────
// 회원 (Members DB)
// ─────────────────────────────────────────────────────────────

// Notion 페이지 → Member 타입으로 변환
function mapMember(page: PageObjectResponse): Member {
    return {
        id:       page.id,
        name:     getText(page, "이름"),   // Notion DB의 타이틀 필드명이 "이름"
        phone:    getText(page, "phone"),
        joinDate: getDate(page, "joinDate"),
        isActive: getCheckbox(page, "isActive"),
        isAdmin:  getCheckbox(page, "isAdmin"),
    };
}

// 전체 회원 목록 조회
export async function getMembers(): Promise<Member[]> {
    const res = await notion.dataSources.query({ data_source_id: DB_IDS.members });
    return res.results
        .filter((p): p is PageObjectResponse => "properties" in p)
        .map(mapMember);
}

// ID로 회원 1명 조회
export async function getMemberById(id: string): Promise<Member | null> {
    try {
        const page = await notion.pages.retrieve({ page_id: id });
        return mapMember(page as PageObjectResponse);
    } catch {
        return null;
    }
}

// 이름으로 회원 찾기 (로그인 시 사용)
export async function getMemberByName(name: string): Promise<Member | null> {
    const res = await notion.dataSources.query({
        data_source_id: DB_IDS.members,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filter: { property: "이름", title: { equals: name } } as any,
    });
    const page = res.results[0];
    if (!page || !("properties" in page)) return null;
    return mapMember(page as PageObjectResponse);
}

// 회원 추가
export async function createMember(data: {
    name: string;
    phone: string;
    joinDate: string;
    isActive: boolean;
    isAdmin: boolean;
    passwordHash: string;
}): Promise<Member> {
    const page = await notion.pages.create({
        parent: { data_source_id: DB_IDS.members } as any,
        properties: {
            "이름":        { title: [{ text: { content: data.name } }] },
            phone:        { rich_text: [{ text: { content: data.phone } }] },
            joinDate:     { date: { start: data.joinDate } },
            isActive:     { checkbox: data.isActive },
            isAdmin:      { checkbox: data.isAdmin },
            passwordHash: { rich_text: [{ text: { content: data.passwordHash } }] },
        },
    });
    return mapMember(page as PageObjectResponse);
}

// 회원 정보 수정
export async function updateMember(id: string, data: Partial<{
    name: string;
    phone: string;
    joinDate: string;
    isActive: boolean;
    isAdmin: boolean;
    passwordHash: string;
}>): Promise<Member> {
    const properties: Record<string, unknown> = {};
    if (data.name)         properties["이름"]       = { title: [{ text: { content: data.name } }] };
    if (data.phone)        properties.phone        = { rich_text: [{ text: { content: data.phone } }] };
    if (data.joinDate)     properties.joinDate     = { date: { start: data.joinDate } };
    if (data.isActive !== undefined) properties.isActive = { checkbox: data.isActive };
    if (data.isAdmin  !== undefined) properties.isAdmin  = { checkbox: data.isAdmin };
    if (data.passwordHash) properties.passwordHash = { rich_text: [{ text: { content: data.passwordHash } }] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await notion.pages.update({ page_id: id, properties: properties as any });
    return mapMember(page as PageObjectResponse);
}

// 회원 삭제 (Notion에서는 아카이브 처리)
export async function deleteMember(id: string): Promise<void> {
    await notion.pages.update({ page_id: id, archived: true });
}

// 비밀번호 해시값 조회 (로그인 검증용)
export async function getMemberPasswordHash(id: string): Promise<string> {
    const page = await notion.pages.retrieve({ page_id: id });
    return getText(page as PageObjectResponse, "passwordHash");
}

// ─────────────────────────────────────────────────────────────
// 입금 내역 (Transactions DB)
// ─────────────────────────────────────────────────────────────

function mapTransaction(page: PageObjectResponse): Transaction {
    return {
        id:         page.id,
        memberId:   getRelationId(page, "member"),
        memberName: getText(page, "memberName"),
        year:       getNumber(page, "year"),
        month:      getNumber(page, "month"),
        amount:     getNumber(page, "amount"),
    };
}

// 입금 내역 조회 (연도·월 필터 선택)
export async function getTransactions(year?: number, month?: number): Promise<Transaction[]> {
    const filters: object[] = [];
    if (year)  filters.push({ property: "year",  number: { equals: year } });
    if (month) filters.push({ property: "month", number: { equals: month } });

    const res = await notion.dataSources.query({
        data_source_id: DB_IDS.transactions,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filter: filters.length > 0 ? { and: filters as any } : undefined,
        sorts: [{ property: "month", direction: "descending" }],
    });
    return res.results
        .filter((p): p is PageObjectResponse => "properties" in p)
        .map(mapTransaction);
}

// 입금 내역 추가
export async function createTransaction(data: {
    memberId: string;
    memberName: string;
    year: number;
    month: number;
    amount: number;
}): Promise<Transaction> {
    const page = await notion.pages.create({
        parent: { data_source_id: DB_IDS.transactions } as any,
        properties: {
            title:      { title: [{ text: { content: `${data.memberName} ${data.year}-${String(data.month).padStart(2, "0")}` } }] },
            member:     { relation: [{ id: data.memberId }] },
            memberName: { rich_text: [{ text: { content: data.memberName } }] },
            year:       { number: data.year },
            month:      { number: data.month },
            amount:     { number: data.amount },
        },
    });
    return mapTransaction(page as PageObjectResponse);
}

// 입금 내역 수정 (금액, 연도, 월 수정 가능)
export async function updateTransaction(id: string, data: Partial<{
    year: number;
    month: number;
    amount: number;
}>): Promise<Transaction> {
    const properties: Record<string, unknown> = {};
    if (data.year   !== undefined) properties.year   = { number: data.year };
    if (data.month  !== undefined) properties.month  = { number: data.month };
    if (data.amount !== undefined) properties.amount = { number: data.amount };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await notion.pages.update({ page_id: id, properties: properties as any });
    return mapTransaction(page as PageObjectResponse);
}

// 입금 내역 삭제
export async function deleteTransaction(id: string): Promise<void> {
    await notion.pages.update({ page_id: id, archived: true });
}

// ─────────────────────────────────────────────────────────────
// 지출 내역 (Expenses DB)
// ─────────────────────────────────────────────────────────────

function mapExpense(page: PageObjectResponse): Expense {
    return {
        id:          page.id,
        title:       getText(page, "title"),
        amount:      getNumber(page, "amount"),
        category:    getSelect(page, "category") as ExpenseCategory,
        usedAt:      getDate(page, "usedAt"),
        description: getText(page, "description"),
        photos:      getFiles(page, "photos"),
    };
}

// 지출 목록 조회 (카테고리 필터 선택)
export async function getExpenses(category?: string): Promise<Expense[]> {
    const res = await notion.dataSources.query({
        data_source_id: DB_IDS.expenses,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filter: category ? { property: "category", select: { equals: category } } as any : undefined,
        sorts: [{ property: "usedAt", direction: "descending" }],
    });
    return res.results
        .filter((p): p is PageObjectResponse => "properties" in p)
        .map(mapExpense);
}

// 지출 추가
export async function createExpense(data: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    usedAt: string;
    description: string;
}): Promise<Expense> {
    const page = await notion.pages.create({
        parent: { data_source_id: DB_IDS.expenses } as any,
        properties: {
            title:       { title: [{ text: { content: data.title } }] },
            amount:      { number: data.amount },
            category:    { select: { name: data.category } },
            usedAt:      { date: { start: data.usedAt } },
            description: { rich_text: [{ text: { content: data.description } }] },
        },
    });
    return mapExpense(page as PageObjectResponse);
}

// 지출 수정
export async function updateExpense(id: string, data: Partial<{
    title: string;
    amount: number;
    category: ExpenseCategory;
    usedAt: string;
    description: string;
}>): Promise<Expense> {
    const properties: Record<string, unknown> = {};
    if (data.title)           properties.title       = { title: [{ text: { content: data.title } }] };
    if (data.amount !== undefined) properties.amount = { number: data.amount };
    if (data.category)        properties.category    = { select: { name: data.category } };
    if (data.usedAt)          properties.usedAt      = { date: { start: data.usedAt } };
    if (data.description !== undefined) properties.description = { rich_text: [{ text: { content: data.description } }] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await notion.pages.update({ page_id: id, properties: properties as any });
    return mapExpense(page as PageObjectResponse);
}

// 지출 삭제
export async function deleteExpense(id: string): Promise<void> {
    await notion.pages.update({ page_id: id, archived: true });
}

// ─────────────────────────────────────────────────────────────
// 게시글 (Posts DB)
// ─────────────────────────────────────────────────────────────

function mapPost(page: PageObjectResponse): Post {
    return {
        id:         page.id,
        title:      getText(page, "title"),
        authorId:   getRelationId(page, "author"),
        authorName: getText(page, "authorName"),
        content:    getText(page, "content"),
        photos:     getFiles(page, "photos"),
        createdAt:  getDate(page, "createdAt"),
        isPinned:   getCheckbox(page, "isPinned"),
    };
}

// 게시글 목록 조회 (페이지네이션: 한 번에 최대 20개)
export async function getPosts(cursor?: string): Promise<{ posts: Post[]; nextCursor: string | null }> {
    const res = await notion.dataSources.query({
        data_source_id: DB_IDS.posts,
        start_cursor: cursor,
        page_size: 20,
        sorts: [
            { property: "isPinned",  direction: "descending" }, // 공지 먼저
            { property: "createdAt", direction: "descending" }, // 최신순
        ],
    });
    return {
        posts: res.results
            .filter((p): p is PageObjectResponse => "properties" in p)
            .map(mapPost),
        nextCursor: res.next_cursor,
    };
}

// 게시글 1개 상세 조회
export async function getPost(id: string): Promise<Post | null> {
    try {
        const page = await notion.pages.retrieve({ page_id: id });
        return mapPost(page as PageObjectResponse);
    } catch {
        return null;
    }
}

// 게시글 작성
export async function createPost(data: {
    title: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
    photos?: string[]; // 이미지 URL 목록 (선택)
}): Promise<Post> {
    const page = await notion.pages.create({
        parent: { data_source_id: DB_IDS.posts } as any,
        properties: {
            title:      { title: [{ text: { content: data.title } }] },
            author:     { relation: [{ id: data.authorId }] },
            authorName: { rich_text: [{ text: { content: data.authorName } }] },
            content:    { rich_text: [{ text: { content: data.content } }] },
            createdAt:  { date: { start: data.createdAt } },
            isPinned:   { checkbox: false },
            // 이미지가 있을 때만 photos 속성 추가 (external URL로 저장)
            ...(data.photos && data.photos.length > 0 && {
                photos: {
                    files: data.photos.map((url) => ({
                        name: url,
                        external: { url },
                    })),
                },
            }),
        },
    });
    return mapPost(page as PageObjectResponse);
}

// 게시글 수정
export async function updatePost(id: string, data: Partial<{
    title: string;
    content: string;
    isPinned: boolean;
}>): Promise<Post> {
    const properties: Record<string, unknown> = {};
    if (data.title)            properties.title    = { title: [{ text: { content: data.title } }] };
    if (data.content !== undefined) properties.content = { rich_text: [{ text: { content: data.content } }] };
    if (data.isPinned !== undefined) properties.isPinned = { checkbox: data.isPinned };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await notion.pages.update({ page_id: id, properties: properties as any });
    return mapPost(page as PageObjectResponse);
}

// 게시글 삭제
export async function deletePost(id: string): Promise<void> {
    await notion.pages.update({ page_id: id, archived: true });
}
