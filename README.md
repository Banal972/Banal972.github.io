# Banal.log

개발자의 회고록 — https://banal972.github.io

Jekyll(jekyll-theme-chirpy) 로 운영하던 블로그를 **Astro** 로 이관한 버전입니다.

## 개발

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 정적 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
```

## 글 쓰기

`src/content/blog/<slug>.md` 파일을 만들면 됩니다. **파일명이 그대로 URL** 이 됩니다
(`src/content/blog/use-modal.md` → `/posts/use-modal/`).

```markdown
---
title: 글 제목
date: 2026-01-01
categories: [React]
tags: [React, Hooks]
description: 목록/검색/SEO 에 쓰일 요약. 생략하면 본문 앞부분에서 자동 생성됩니다.
heroImage: /assets/img/post/2026-01-01-slug/cover.png # 없으면 카테고리 색 타이포 카드로 대체
draft: false # true 면 dev 에서만 보이고 빌드에서 제외
pin: false # true 면 홈 상단 고정
---
```

이미지는 `public/assets/img/post/<날짜-slug>/` 아래 두고 `/assets/img/post/...` 로 참조합니다.
경로 규칙을 Chirpy 시절과 똑같이 유지해서 기존 글의 이미지 링크가 그대로 살아 있습니다.

## 설정

- `src/consts.ts` — 사이트 제목, 저자, 페이지당 글 수, AdSense, giscus, 내비게이션, 카테고리 표시명/색
- `src/styles/global.css` — 색·여백·타이포 토큰. UI 손볼 때 여기부터 보면 됩니다.
- `astro.config.mjs` — 사이트 URL, URL 형식, 마크다운 파이프라인

## 이관 시 지킨 것

- **URL 100% 보존**: 기존 35편의 `/posts/<slug>/` 를 대소문자까지 그대로 유지했습니다
  (`/posts/sprintDay/`, `/posts/createRef-Modal/` 등). `/categories/`, `/tags/`, `/archives/`,
  `/about/`, `/page/2/` 도 동일합니다.
- **마크다운 렌더링 호환**: kramdown 에서만 통하던 두 가지를 보정합니다.
  - `**‘대리’**라는` 처럼 한글에 붙은 강조 → `remark-cjk-friendly`
  - `</div>` 바로 다음 줄의 본문이 HTML 블록에 먹히는 문제 → 변환 시 빈 줄 삽입
    (`scripts/migrate-jekyll-posts.mjs` 의 `normalizeHtmlBlocks`)

`scripts/migrate-jekyll-posts.mjs` 는 Chirpy `_posts/` → `src/content/blog/` 일회성 변환
스크립트입니다. 원본은 `master` 브랜치 히스토리에 남아 있습니다.

## 배포

`.github/workflows/deploy.yml` 는 현재 **수동 실행(workflow_dispatch)** 만 열려 있습니다.
전환 준비가 끝나면 `push` 트리거 주석을 풀면 master 푸시마다 자동 배포됩니다.
