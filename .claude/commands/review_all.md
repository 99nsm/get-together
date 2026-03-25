---
description: '프로젝트의 전체적인 흐름과 구조를 분석하여 리포트를 작성합니다'
allowed-tools:
  [
    'Read',
    'Glob',
    'Grep',
  ]
---

# Claude 명령어: Review

프로젝트의 전체 구조, 페이지 흐름, 컴포넌트 관계를 분석하여 리뷰 리포트를 작성합니다.

## 사용법

/review

## 토큰 효율 원칙

- 전체 파일을 다 읽지 말 것 — Glob으로 구조 파악 후 핵심 파일만 Read
- `components/ui/` 내부 shadcn 파일은 읽지 않음 (자동 생성 코드)
- Grep으로 useState, import 패턴만 추출하여 흐름 파악
- 리포트는 bullet point로 간결하게 작성

## 프로세스

1. Glob으로 app/, components/ 파일 목록만 파악
2. package.json 읽어 기술 스택 확인
3. app/layout.tsx와 각 page.tsx만 Read (UI 컴포넌트 스킵)
4. Grep으로 useState, props 패턴 추출 → 데이터 흐름 파악
5. 리뷰 리포트 작성

## 리포트 형식

### 1. 프로젝트 개요
- 목적 및 기술 스택 (package.json 기반)

### 2. 페이지 구조
- 각 페이지의 역할과 주요 기능

### 3. 컴포넌트 맵
- 레이아웃 / 커스텀 컴포넌트 관계 (shadcn UI는 목록만)

### 4. 데이터 흐름
- useState/props 흐름 (Grep 결과 기반 요약)

### 5. 개선 제안
- 코드 품질, 구조 관련 제안
