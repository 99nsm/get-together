// lib/notion.ts
// Notion API 클라이언트 설정 파일
// 이 파일은 서버 사이드(API Routes)에서만 사용해야 합니다.
// 클라이언트(브라우저)에서 import하면 API 키가 노출되니 주의!

import { Client } from "@notionhq/client";

// Notion 클라이언트 인스턴스 (싱글턴)
// process.env.NOTION_API_KEY는 .env.local에서 읽어옵니다
export const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

// 각 DB의 ID를 한 곳에 모아 관리합니다
export const DB_IDS = {
    members:      process.env.NOTION_MEMBERS_DB_ID!,
    transactions: process.env.NOTION_TRANSACTIONS_DB_ID!,
    expenses:     process.env.NOTION_EXPENSES_DB_ID!,
    posts:        process.env.NOTION_POSTS_DB_ID!,
};
