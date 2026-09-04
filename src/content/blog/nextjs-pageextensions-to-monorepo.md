---
title: "pageExtensions를 걷어내고 모노레포로 간 이유"
date: 2026-09-04
categories: ["Nextjs"]
tags: ["모노레포", "Yarn Workspaces", "리팩터링", "Docker", "ESLint"]
---

제가 맡은 프로젝트는 한 레포에서 두 도메인을 빌드하고 있었습니다.
일반 사용자가 사용하는 사이트와 마케팅 광고주가 사용하는 관리 사이트, 이렇게 두 도메인을 사용하고 있습니다.

방식은 Next.js 의 `pageExtensions`를 사용하고 있었고, 페이지 파일에 `.user` / `.ad` / `.sh` 접미사를 붙여두고, 빌드할 때 어느 확장자 집합을 읽을지 환경변수로 정하는 구조였죠.

이 방식은 문제 없이 잘 돌아가기는 했습니다. 다만 **잘 돌아가는 부분이 제가 기대한것은 아니였습니다.**

---

## pageExtensions 가 분리하지 못한 것이 뭘까?

일단 먼저 짚고 가야 할 게 있습니다. `pageExtensions` 는 잘 작동하고 큰 문제는 없다는것이죠.

마케팅 광고주 빌드에는 일반 사용자 페이지는 없고, 라우트가 안 생기는 정도가 아니라 번들에도 안 들어가지 않습니다. 이 부분은 잘 지켜지고 있었지만.

문제는 **페이지 아래**였습니다.

라우트는 분리가 되었는데 그 아래에 있는 `src/features`, `src/components`, `src/lib` 는 여전히 하나였고, TypeScript 프로젝트도 `package.json` 도 하나였습니다. 그러다 보니 이런 코드가 아무 저항 없이 쌓이게 되죠.

```ts
// src/components/layout/Layout/index.tsx — 두 사이트가 같이 쓰는 레이아웃
import { useAdvertiserLogoutMutation } from "@/features/advertiser/account/hooks/use-advertiser-logout-mutation";
import { useUserLogoutMutation } from "@/features/user/account/hooks/use-user-logout-mutation";
```

```ts
// 광고주 상품 등록 화면에서
import { ProductDetailScreen } from "@/features/user/product/screens";
```

특히 두 번째 코드는 광고주가 상품을 등록할 때 "사용자에게는 이렇게 보입니다" 하는 미리보기를 띄워주는 기능이 따로 존재합니다. 그런데 그 미리보기가 사용자 앱의 **완성된 Screen 을 통째로 가져다** 쓰고 있습니다.

그 Screen 안에는 사용자 인증 가드도 있고, 신청 CTA 도 있고, 상품 조회 쿼리도 다 들어있죠. 그걸 `previewMode` 라는 boolean 하나로 전부 무력화하는 구조였습니다.

---

## 그렇다면 얼마나 새고 있을까?

느낌만으로 이야기하고 싶지는 않아서 한번 세어봤습니다.

import 그래프를 만들어서 경계를 넘는 간선만 뽑아내는 스크립트를 짰습니다.

```js
// 사용자/광고주 트리 바깥에서 그 트리를 참조하거나,
// 반대편 트리를 참조하는 간선만 수집한다
if ((targetSide === 'user' || targetSide === 'ad') && targetSide !== fileSide) {
  leaks.push([rel(file), rel(resolved)])
  continue
}
```

결과는 **20건**이었습니다.

| 방향             | 건수 | 대표 사례                                            |
| ---------------- | ---- | ---------------------------------------------------- |
| 광고주 → 사용자  | 6    | 등록 미리보기가 `ProductDetailScreen` 을 그대로 사용 |
| 사용자 → 광고주  | 6    | 상품 완료 화면이 광고주 상품 타입을 참조             |
| 공용 → 양쪽 동시 | 8    | `Layout`, 인증 타입, `ProductCard`                   |

여기서 제일 눈에 걸린건 세 번째 줄이었습니다. "공용" 폴더에 있는 코드가 양쪽 도메인을 동시에 알고 있다면 그건 공용이라기보다는 그냥 둘을 합쳐놓은 것에 가깝겠죠.

---

## 그 외에 불편했던 것들

경계가 흐린 문제 말고도 개발하면서 자잘하게 걸리는 것들이 있었습니다.

**사이트를 바꾸려면 개발 서버를 다시 띄워야 했습니다.** 광고주 화면을 보려면 환경변수를 바꿔서 재시작을 해야 했거든요. 두 서버를 동시에 띄우는 것도 자연스럽게 되지 않아서, 사용자 화면과 광고주 화면을 나란히 놓고 비교하는 흔한 작업이 매번 번거로웠습니다.

**`public` 이 분리되지 않았습니다.** `pageExtensions` 는 코드만 분리해주기 때문에 정적 자산은 통째로 들어갑니다. 그래서 광고주 배포 이미지에 사용자 사이트 브랜드 자산이랑 화면용 이미지가 전부 실려 있었죠.

**타입 검사와 린트도 한 덩어리였습니다.** 사용자 코드 한 줄만 고쳐도 `tsc` 는 광고주 코드까지 전부 다시 봅니다.

---

## 그래서 어떤 구조로 옮겼나?

Turborepo 굳이 쓰고 싶지도 않고, 이미 yarn으로 개발이 되고 있으니 pnpm 전환도 없이, 원래 쓰던 **Yarn 1.x Workspaces** 그대로 갔습니다. 루트 `yarn.lock` 하나를 유지하는 구조죠.

한 번에 여러가지를 같이 바꾸면 나중에 뭐가 문제인지 알기 어려워지기 때문에, 이번에는 구조만 건드리기로 했습니다.

```text
apps/
  user/              @app/user          사용자 사이트    (dev :3000)
  advertiser/        @app/advertiser    광고주 사이트    (dev :3001)

packages/
  ui/                @app/ui            디자인 시스템 · 공용 UI · 토큰/폰트/아이콘
  shared/            @app/shared        포맷/유틸 · 공용 훅·스토어 · PWA/푸시
  api-client/        @app/api-client    공통 HTTP 클라이언트
```

의존 방향은 한 방향으로만 흐르도록 정했습니다.

```text
apps/user       ─┐
                 ├──> packages/ui ──> packages/shared ──> packages/api-client
apps/advertiser ─┘

packages/*      ─X─> apps/*
apps/user       ─X─> apps/advertiser
apps/advertiser ─X─> apps/user
```

그리고 페이지 접미사(`.user.tsx` / `.ad.tsx` / `.sh.tsx`)는 전부 없앴습니다. 이제 각 앱의 `src/pages` 가 그 사이트의 라우트 전부이기 때문에 파일명 규칙을 따로 지킬 필요가 없어졌죠. 디렉터리 자체가 경계 역할을 해주니까요.

루트 스크립트에서 하나 걸린 부분이 있었는데, `yarn workspaces run <script>` 는 순차 실행이라 개발 서버 두 개를 동시에 못 띄웁니다. 타입 검사나 테스트는 순차로 돌려도 상관없지만 dev 는 안 되죠.

```json
"dev": "yarn dev:user & yarn dev:advertiser & wait",
"typecheck": "yarn workspaces run typecheck",
```

---

## 무엇을 공용으로 올려야 할까?

사실 이 판단이 이번 작업의 절반이었습니다.

기존 `src/components` 나 `src/lib` 를 통째로 `packages/shared` 에 밀어넣으면 아무것도 해결되지 않습니다. 흐린 경계를 그대로 두고 이름만 바꿔서 옮기는 셈이 되니까요.

그래서 기준을 하나로 잡았습니다. **사이트를 아는 코드는 공용이 아니다** 라는 기준입니다.

`src/components` 의 28개 디렉터리를 이 기준으로 훑어봤는데, 사이트를 아는 파일은 다섯 개, 네 디렉터리뿐이었습니다.

```bash
$ grep -rn "@/site\|@/constants\|@/features\|@/store" src/components
src/components/footer/Footer/index.tsx      → site, 상담 링크, useMeQuery
src/components/card/ProductCard/index.tsx   → 사용자 product 타입/유틸
src/components/layout/Layout/index.tsx      → 양쪽 logout 훅, site, store
src/components/layout/Layout/Layout.css.ts  → site.brand.background
src/components/brand/BrandLogo/index.tsx    → site.brand.logo
```

나머지 24개는 사용자나 광고주 어느 한쪽의 설정이나 기능에도 의존하지 않는 코드였습니다. 그중 실제로 한쪽 앱에서만 사용하는 코드는 해당 앱으로 옮기고, 두 앱이 함께 사용하는 코드는 `@app/ui` 로 옮겼습니다.

문제는 다섯 개인데, 이건 각자 다르게 처리했습니다.

### 앱마다 하나씩 갖게 한 것

`Layout` 과 `Footer` 입니다.

코드가 비슷해 보여도 실제로는 꽤 다른데, 사용자 레이아웃에는 하단 내비게이션이 있지만 광고주 쪽에는 없고, 광고주 레이아웃에는 광고주 전용 링크가 있지만 사용자 사이트에는 없거든요.

예전에는 `site.advertiserOnly ? ... : ...` 같은 삼항 연산자로 한 파일에 눌러담았는데, 앱별로 나누고 나니 각 파일에서 그 분기가 전부 사라졌습니다.

### 프리미티브와 바인딩을 분리한 것

`BrandLogo` 입니다.

이미지 박스 로직(브랜드마다 종횡비가 달라서 `object-fit` 으로 맞춰주는 부분)은 사이트를 모르는 코드입니다. 그래서 그 부분만 `@app/ui` 의 `BrandMark` 로 올리고, 어떤 자산을 넣을지는 앱이 정하도록 했습니다.

```tsx
// packages/ui — 사이트를 모른다
export function BrandMark({
  maxWidth,
  maxHeight,
  style,
  alt = "",
  ...props
}: BrandMarkProps) {
  return (
    <img alt={alt} style={boxStyle(maxWidth, maxHeight, style)} {...props} />
  );
}

// apps/user — 자기 사이트를 안다
export function BrandLogo(props: BrandLogoProps) {
  return <BrandMark src={site.brand.logo} alt={site.brand.nameKo} {...props} />;
}
```

같은 패턴을 푸시 서비스워커에도 적용했습니다. 알림 아이콘 URL 이 사이트마다 다른데, 공용이 되어야 할 코드가 `site` 를 직접 import 하고 있었거든요.

```ts
// before — packages 가 될 수 없는 코드
import { site } from "@/site";
const SERVICE_WORKER_URL = `/sw.js?apiBaseUrl=...&icon=${encodeURIComponent(site.brand.icon192)}`;
```

```ts
// after — 앱이 진입 시점에 알려준다
let notificationIconUrl = "";

/**
 * 알림 아이콘은 사이트마다 다르다. 공용 패키지는 어느 사이트인지 모르므로
 * 각 앱이 진입 시점에 자기 브랜드 아이콘을 한 번 알려준다.
 */
export function configurePushNotificationIcon(iconUrl: string) {
  notificationIconUrl = iconUrl;
}
```

공용 패키지를 만들 때는 계속 이 생각으로 돌아왔던 것 같습니다. 모르는 값은 직접 가져오지 말고 받으면 된다는 것이죠.

---

## 제일 큰 작업이었던 상품 상세 화면

앞에서 이야기한 `ProductDetailScreen` 문제입니다. 광고주 등록 폼이 사용자의 완성된 화면을 그대로 렌더하고 있던 그 코드요.

원래 구조는 이랬습니다.

```text
ProductDetailScreen (193줄)
├── useUserProductDetailScreen (350줄)      ← 조회 + 인증 가드 + 신청 + 탭 상태 + 스크롤
├── sections.tsx (214줄)                    ← 순수 표시
├── ProductDeadlineBadge.tsx (70줄)         ← 순수 표시 + 1초 타이머
└── ProductDetailScreen.css.ts (857줄)      ← 상세 + 동의 + 완료 화면 스타일이 뒤섞임
```

훅 하나에 네트워크와 인증과 표시 상태가 전부 들어있다 보니, 광고주가 재사용을 하려면 `previewMode` 로 조회를 끄고 가드를 끄고 CTA 를 끄는 수밖에 없었던 겁니다.

여기서도 기준은 하나로 잡았습니다. **이 코드가 서버나 로그인 상태를 아는가** 였죠.

- 탭 상태, 탭 전환 시 스크롤 애니메이션, 남은시간 카운트다운, 가격/할인율 계산 → 모릅니다. 공용으로 보냈습니다.
- 상품 조회 쿼리, 성인 인증 가드, 신청 버튼, 로그아웃 다이얼로그 → 압니다. 사용자 앱에 남겼습니다.

그렇게 해서 `@app/ui/product-preview` 가 나왔습니다.

```tsx
export function ProductPreview({
  product,
  controller,
  isPending = false,
  showBackButton = false,
  topBarRight,   // 홈/공유 버튼 — 미리보기에서는 비운다
  footer,        // 신청 CTA — 미리보기에서는 비운다
}: ProductPreviewProps) {
```

사용자 상세 페이지는 슬롯을 채워서 사용하고

```tsx
<ProductPreview
  product={data.product}
  controller={preview}
  isPending={state.isPending}
  showBackButton
  topBarRight={<>{/* 홈 · 공유 */}</>}
  footer={
    <div className={S.ctaBar}>
      <Button>{derived.ctaLabel}</Button>
    </div>
  }
/>
```

광고주 미리보기는 슬롯을 비워두면 됩니다.

```tsx
export function AdvertiserProductPreview({
  product,
}: AdvertiserProductPreviewProps) {
  const controller = useProductPreview({ product });
  return <ProductPreview product={product} controller={controller} />;
}
```

이렇게 하니 `previewMode` 플래그가 자연스럽게 사라졌습니다. 기능을 끄는 플래그를 기능을 켜는 슬롯으로 뒤집은 셈이죠. 훅과 화면에서 16번 등장하던 `previewMode` 분기가 통째로 없어졌고, 훅 자체도 350줄에서 263줄로 줄었습니다.

타입도 같이 정리했는데요, 광고주 코드가 사용자 상세 타입을 import 하던 걸 중립적인 `ProductPreviewProduct` 로 바꾸고 미리보기가 실제로 그리는 필드만 남겼습니다.

그랬더니 광고주 폼에서 미리보기 데이터를 만들 때 채우던 필드가 39개에서 26개로 줄었습니다. 빠진 13개는 화면에 한 번도 안 그려지고 오직 사용자 타입을 만족시키려고 존재하던 값이었죠.

---

## 경계를 린트로 고정하기

사실 이 작업에서 중요한건 지금 경계를 정리했다는 것보다, 다시 흐려지지 않게 만드는 쪽이라고 생각했습니다.

전에도 경계라는건 있었습니다. 다만 `@/` 가 전부 열려 있어서 지키는게 순전히 의지 문제였고, 그 의지가 20번 진 결과가 앞에서 본 그 숫자였던 거죠.

그래서 각 workspace 의 `eslint.config.mjs` 에 규칙을 박아뒀습니다.

```js
{
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@app/advertiser', '@app/advertiser/*'],
        message: '사용자 앱은 광고주 앱 코드를 import 할 수 없습니다. 공용 코드는 packages/* 로 옮기세요.',
      }],
    }],
  },
},
```

`packages/shared` 에는 자기보다 위에 있는 것들을 전부 막았습니다.

```js
group: [
  '@app/user', '@app/user/*',
  '@app/advertiser', '@app/advertiser/*',
  '@app/ui', '@app/ui/*',
],
message: '@app/shared 는 앱과 UI 패키지를 참조하지 않습니다. (의존 방향: apps → ui → shared → api-client)',
```

규칙을 넣었으면 실제로 잡히는지 보기위해 일부러 위반하는 파일을 하나 만들어서 돌려봤습니다.

```text
apps/user/src/__boundary-probe.ts
  1:1  error  '@app/advertiser/src/features/product/api' import is restricted…
             사용자 앱은 광고주 앱 코드를 import 할 수 없습니다.  no-restricted-imports
```

이제 경계 위반은 코드 리뷰에서 사람이 잡는게 아니라 `yarn lint` 가 잡아줍니다.

그리고 애초에 앱끼리는 `@/` alias 로 서로를 볼 수가 없습니다. 각 앱의 `@/` 는 자기 `src` 만 가리키니까요. 린트는 두 번째 그물이고 첫 번째 그물은 alias 그 자체인 셈이죠.

---

### standalone 출력 구조가 바뀝니다

모노레포에서는 `output: 'standalone'` 의 결과물 모양이 달라집니다.

`outputFileTracingRoot` 를 저장소 루트로 올려야 심볼릭 링크 너머에 있는 `packages/*` 가 추적에 들어오는데, 그렇게 하면 진입점이 `server.js` 가 아니라 `apps/<app>/server.js` 로 바뀝니다.

```ts
// standalone 출력이 모노레포 루트의 심볼릭 링크까지 따라가도록 추적 기준을 올린다.
outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
```

그리고 `CMD` 는 exec 형식이라 `ARG` 를 직접 못 쓰기 때문에, `ENV` 로 구워서 셸로 펼쳐줬습니다.

```dockerfile
ENV APP_DIR="apps/${APP_NAME}"
CMD ["sh", "-c", "node ${APP_DIR}/server.js"]
```

### .dockerignore 도 모노레포가 아니였으니 수정해주었습니다.

모노레포로 전환을 하고 나서 빌드 컨텍스트 전송이 갑자기 무거워졌는데, `.dockerignore` 의 선두 패턴이 컨텍스트 루트만 매칭하기 때문이었습니다.

```text
node_modules/     # /node_modules 만 걸린다
.next/            # /.next 만 걸린다
```

예전에는 `.next` 가 저장소 루트에 하나뿐이라 이걸로 충분했습니다. 그런데 지금은 `apps/user/.next` 와 `apps/advertiser/.next` 가 따로 있고 둘 다 선두 패턴에 안 걸리다 보니, 합쳐서 518MB 가 매 빌드마다 컨텍스트에 실려 가고 있었습니다.

그래서 `**` 접두 패턴을 같이 넣어줘야 합니다.

```text
node_modules/
**/node_modules/
.next/
**/.next/
out/
**/out/
```

이건 에러가 전혀 나지 않고 그냥 조용히 느려지기만 해서 한참 뒤에 알았습니다.

마지막으로 두 이미지를 실제로 띄워서 확인해봤습니다.

```text
[사용자 이미지]
/           200
/guide      200
/advertiser 301 → 광고주 도메인
브랜드 자산(사용자)  200
브랜드 자산(광고주)  없음

[광고주 이미지]
/advertiser 200
/           307 → /advertiser
/product/1  404
브랜드 자산(광고주)  200
```

---

## 그래서 얼마나 좋아졌을까?

측정한 것만 적어보겠습니다. 로컬 맥에서 webpack 빌드로 잰 값이라 절대값보다는 방향만 봐주시면 좋을것 같습니다.

먼저 **타입 검사**인데, 프로젝트가 나뉘면서 각 앱이 보는 파일 수가 줄었습니다.

|                 | before | after (사용자) | after (광고주) |
| --------------- | ------ | -------------- | -------------- |
| `tsc` 대상 파일 | 551    | 384            | 367            |
| `tsc --noEmit`  | 3.94s  | 2.87s          | 2.61s          |

다음은 **빌드**이고, 한 사이트 빌드 기준입니다.

|        | before | after  |
| ------ | ------ | ------ |
| 사용자 | 28.70s | 25.48s |
| 광고주 | 28.01s | 25.09s |

솔직히 빌드 시간 자체는 큰 차이가 아닙니다. 이 규모에서 webpack 컴파일은 원래 6~7초 정도고 나머지는 페이지 생성이랑 트레이싱이 먹는 시간이거든요.

그래서 진짜 이득은 시간보다는 확신 쪽이라고 생각합니다. 한쪽만 건드렸으니 한쪽만 빌드하고 검사하면 된다고 말할 수 있게 됐으니까요. 예전에도 빌드는 두 번 돌렸지만, 사용자 코드를 고쳤을 때 광고주 빌드를 안 돌려도 되는지는 알 수가 없었습니다.

**배포 이미지**는 여기가 제일 확실했습니다.

| 광고주 이미지 안의 `public` | before | after |
| --------------------------- | ------ | ----- |
| 전체                        | 5.8MB  | 576KB |
| 사용자 브랜드 자산          | 1.3MB  | —     |
| 홈 화면 이미지              | 2.3MB  | —     |
| 상품 이미지                 | 1.2MB  | —     |
| 사용자 화면 이미지          | 532KB  | —     |
| 광고주 브랜드 자산          | 312KB  | 312KB |
| 광고주 화면 이미지          | 236KB  | 236KB |

광고주 이미지에서 사용자 전용 자산 5.3MB 가 빠졌습니다.

마지막으로 **URL** 은 라우트 집합이 정확히 같아야 하기 때문에 스크립트로 대조해봤습니다.

```text
사라진 라우트: 없음
새로 생긴 라우트: 없음
```

---

### 덤으로 드러난 것

각 workspace 가 실제로 쓰는 패키지를 import 그래프에서 뽑아서 `package.json` 과 대조해봤는데요, 캐러셀 라이브러리 하나가 어디에도 선언돼 있지 않았습니다.

루트 hoisting 덕분에 우연히 동작하고 있던 것이었고, `yarn.lock` 에서 조용히 사라지는걸 보고 알았습니다. 반대로 아무도 안 쓰는데 계속 남아있던 패키지도 있었고요.

---

## 그럼 잃은건 없을까?

좋은 것만 적으면 글이 아니니까 솔직하게 적어보겠습니다.

**Storybook 이 디자인 시스템 범위로 좁아졌습니다.** 스토리북 하나가 `@/` alias 하나만 가질 수 있는데 앱마다 `@/` 가 다른 곳을 가리키거든요. 그래서 `packages/ui` 에 스토리북을 두고 앱 셸 컴포넌트의 스토리 6개는 지웠습니다. 앱별로 스토리북을 따로 세우는 선택지도 있었지만, 스토리 3개씩을 위해서 툴체인을 두 벌 들이는건 좀 과하겟다고 생각했어요.

그래도 하나는 건졌는데, `AuthLayout` 은 `next/head` 만 쓰는 순수 래퍼라 양쪽 앱에 똑같이 복사돼 있었습니다. 이 정리 과정에서 원래 공용이었어야 했다는게 드러나서 `@app/ui` 로 올렸습니다.

**standalone 번들이 살짝 커졌습니다.** 85MB → 87MB (사용자), 81MB → 83MB (광고주) 정도인데, `outputFileTracingRoot` 를 올린 대가로 `packages/*` 소스가 함께 들어가기 때문입니다. 이미지 전체로 보면 `public` 분리 이득이 더 커서 순감소이긴 하지만, 이 항목만 놓고 보면 손해죠.

**설정 파일도 늘었습니다.** `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, 사이트맵 설정이 앱마다 하나씩 있고 SVGR webpack 규칙 같은건 두 곳에 같은 내용이 들어가 있습니다.

네 번째 패키지로 뽑을까 하다가 그만뒀는데, 앱 설정은 그 앱만 보고 이해되는게 낫다고 판단했습니다. 나중에 점점 늘어나면 분리해볼가도 생각중입니다.

---

## 그럼 pageExtensions 는 나쁜 방법일까?

그렇지는 않습니다. 오해가 없도록 적어두면 `pageExtensions` 방식의 장점은 여전히 유효합니다.

설정 몇 줄이면 끝나고, 워크스페이스도 필요 없고, 라우트 격리를 빌드가 보장해줍니다. 두 사이트가 정말로 같은 앱인데 진입점만 다른 상황이라면 여전히 그쪽이 훨씬 가볍죠.

저희 경우는 시간이 지나면서 그 전제가 깨진것 뿐입니다. 사용자 쪽은 신청하고 리뷰 제출하고 정산을 받고, 광고주 쪽은 상품 등록하고 결제하고 리포트를 봅니다. 공유하는건 디자인 시스템이랑 HTTP 클라이언트, 그리고 상품 상세 화면 하나뿐이었죠.

전제가 깨졌다는 신호는 이렇게 나타났던 것 같습니다.

- 공용 폴더의 파일이 양쪽 도메인을 동시에 import 하기 시작한다
- 한쪽 앱이 다른 쪽의 완성된 Screen 을 플래그로 무력화해서 쓴다
- "이 컴포넌트 고치면 저쪽도 확인해야 하나?" 를 매번 묻게 된다

셋 다 해당된다면 라우트가 아니라 코드 소유권을 나눠야 할 때가 온거라고 봅니다.

---

## 정리

- `pageExtensions` 는 라우트를 나누는 것이지 코드 소유권을 나누는건 아닙니다. 빌드 결과가 둘이어도 TypeScript 프로젝트와 의존성 경계가 하나면 경계는 결국 흐려지게 됩니다.
- 공용의 기준은 위치가 아니라 지식입니다. 사이트를 아는 코드는 `components/` 폴더에 있어도 공용이 아니고, 모르는 값은 props 나 인자로 받게 만들면 됩니다.
- 완성된 화면을 재사용하려고 플래그를 다는 순간이 신호입니다. 기능을 끄는 플래그 대신에 표시 부분을 뽑고 기능을 슬롯으로 주입하는 쪽이 낫습니다.
- 경계는 문서보다 린트로 고정하는게 확실합니다. 이전에도 경계는 있었지만 20번 넘겼고, `no-restricted-imports` 한 블록이면 사람이 아니라 CI 가 잡아줍니다.
- 경로를 가정한 설정은 전부 한 번씩 다시 봐야 합니다. 모노레포 전환은 결국 디렉터리가 한 겹 깊어지는 일이라서, 그 가정을 박아둔 설정이 조용히 어긋나게 됩니다.

이번에 제일 오래 기억에 남을 것 같은건 마지막 항목인것 같아요.

`outputFileTracingRoot` 랑 `@/` alias 는 빌드가 실패해줘서 바로 알았는데, `.dockerignore` 는 아무 에러도 없이 518MB 를 계속 옮기고 있었거든요. 저는 앞으로도 이런 종류의 문제를 제일 조심하게 될 것 같습니다.

덤으로, 이 전환 직후부터 도커 빌드가 메모리 부족으로 죽기 시작했는데, 파보니까 모노레포 탓이 아니었습니다. 이 이야기는 나중에 따로 한 편으로 정리해보겠습니다.
