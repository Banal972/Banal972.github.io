---
title: "1초마다 유튜브 영상이 처음부터 다시 재생된 이유"
date: 2026-08-25
categories: ["React"]
tags: ["dangerouslySetInnerHTML", "memo", "성능 최적화"]
---

외부 에디터에서 작성한 HTML을 그대로 화면에 뿌려야 하는 경우가 있습니다.  
상품 상세 설명이나 공지사항처럼요. 이럴 때 흔히 `dangerouslySetInnerHTML`을 씁니다.

저도 그렇게 쓰고 있었는데, 어느 날 이상한 제보를 받았습니다.  
**본문에 유튜브 영상이 들어간 상품에서 영상이 1초마다 깜빡이며 처음부터 다시 로드된다**는 것이었습니다.

재생 버튼을 눌러도 1초 뒤에 리셋됐습니다. 영상을 볼 수가 없었죠.

---

## 원인은 두 가지가 겹친 것이었습니다

**첫째, 이 화면은 1초마다 리렌더되고 있었습니다.**

선착순 마감 카운트다운이 붙어 있어서 매초 상태가 바뀝니다. 여기까지는 의도한 동작입니다.

**둘째, React는 `dangerouslySetInnerHTML`의 prop 객체가 새로 생기면 내용이 같아도 `innerHTML`을 다시 씁니다.**

```tsx
<div dangerouslySetInnerHTML={{ __html: html }} />
```

이 코드, 아무 문제 없어 보이시죠? 저도 그랬습니다.

하지만 저 객체 리터럴 `{ __html: html }`은 **렌더될 때마다 새로 만들어집니다.**  
React는 `prevProps.dangerouslySetInnerHTML !== nextProps.dangerouslySetInnerHTML`을 **참조로** 비교합니다. 다르면 DOM에 `innerHTML`을 다시 세팅하죠. 문자열 내용이 완전히 똑같아도 마찬가지입니다.

그리고 `innerHTML`을 다시 쓰면 그 안에 있던 노드가 **전부 파괴되고 새로 만들어집니다.**

유튜브 iframe도 예외가 아닙니다. 새 iframe이 되니까 처음부터 다시 로드되는 거죠.

즉 **1초마다 iframe이 새로 태어나고 있었습니다.**

---

## 어떻게 고쳤나

두 겹으로 막았습니다.

### 1겹 - 컴포넌트를 `memo`로 감싸기

```tsx
export const ProductInfoHtml = memo(function ProductInfoHtml({
  className,
  html,
}: ProductInfoHtmlProps) {
  const normalizedHtml = normalizeProductInfoHtml(html);

  return <div className={className} dangerouslySetInnerHTML={{ __html: normalizedHtml }} />;
});
```

부모가 1초마다 리렌더돼도 `html` prop이 같으면 이 컴포넌트는 리렌더되지 않습니다.  
리렌더가 안 되니 객체 리터럴도 다시 안 만들어지고요.

여기까지 하고 끝난 줄 알았는데, 아니었습니다.

### 2겹 - 문자열의 identity 유지하기

원본 HTML을 그대로 쓰는 게 아니라 **정규화를 거치고 있었던 게 문제였습니다.**

```ts
const normalized = html.replace(IFRAME_PATTERN, /* ... */);
```

`String.replace`는 **내용이 같아도 항상 새 문자열을 반환합니다.**

그러니까 정규화가 렌더 중에 돌면 매번 새 문자열이 나오고, 그게 `__html`에 들어가면 결국 원점입니다. `memo`로 막아놨어도 안쪽에서 새 값이 계속 만들어지는 거죠.

그래서 직전 결과 한 건만 캐시했습니다.

```ts
/** 직전 변환 결과 1건 캐시. 같은 원본이면 동일한 문자열 참조를 재사용한다. */
let lastRawHtml: string | null = null;
let lastNormalizedHtml = '';

export function normalizeProductInfoHtml(html?: string | null) {
  if (!html) return '';

  // 상세 화면은 카운트다운 때문에 1초마다 리렌더된다.
  // 원본이 그대로면 직전 결과를 재사용해 같은 문자열(===)을 돌려준다.
  if (html === lastRawHtml) {
    return lastNormalizedHtml;
  }

  const normalized = html.replace(IFRAME_PATTERN, /* ... */);

  lastRawHtml = html;
  lastNormalizedHtml = normalized;
  return normalized;
}
```

**캐시 크기가 1인 게 포인트입니다.**

한 화면에 상세 HTML은 하나뿐이라 그 이상은 필요 없습니다. 괜히 `Map`으로 만들면 메모리 누수를 걱정해야 하죠.

다만 모듈 스코프 변수라서, 여러 인스턴스가 동시에 서로 다른 HTML을 렌더하면 캐시가 계속 엇갈립니다. 목록에서 여러 개를 렌더한다면 `useMemo`로 인스턴스별로 잡아야 합니다.

---

## 곁들여 - `<p>` 안에서 `<div>`를 쓰면 안 되는 이유

정규화가 하는 일은 외부 에디터에서 온 iframe을 반응형으로 만드는 것이었습니다.

```html
<iframe width="780" height="780">
```

이렇게 크기가 고정으로 박혀 있으면 모바일에서 가로로 넘쳐서 잘립니다.  
그래서 고정 속성을 지우고 비율을 유지하는 래퍼로 감쌌습니다.

그런데 여기서 함정을 하나 만났습니다. **래퍼를 `<div>`로 만들면 안 됩니다.**

HTML 파싱 규칙상 `<p>` 안에는 블록 요소가 올 수 없습니다. `<p>` 안에서 `<div>`를 만나면 브라우저가 **`<p>`를 그 자리에서 강제로 닫아버립니다.**

```html
<!-- 내가 만든 것 -->
<p>설명 <div>...<iframe></iframe>...</div> 계속</p>

<!-- 브라우저가 파싱한 결과 -->
<p>설명 </p><div>...<iframe></iframe>...</div> 계속<p></p>
```

문단이 쪼개지고 뒤에 오던 텍스트가 밖으로 튀어나옵니다.

에디터에서 온 HTML은 `<p>` 안에 iframe을 넣는 경우가 정말 많습니다. 그래서 인라인 요소인 `<span>`으로 감쌌습니다.

```ts
return `<span ${PRODUCT_INFO_EMBED_ATTRIBUTE} style="aspect-ratio:${aspectRatio}">${responsiveTag}</span>`;
```

비율은 원본의 `width` / `height` 속성에서 계산하고, 없으면 16:9로 뒀습니다.

스타일은 래퍼에 붙인 데이터 속성을 CSS에서 잡아 걸었습니다. 주입한 HTML에는 CSS Modules 같은 해시 클래스명을 붙일 수가 없거든요. 문자열을 조립하는 시점에는 클래스명을 모르니까요.

---

## 정리

- **`dangerouslySetInnerHTML`은 참조로 비교됩니다.** 객체 리터럴을 인라인으로 넘기면 매 렌더 `innerHTML`이 다시 써지고, 그 안의 iframe·비디오·스크립트가 전부 리셋됩니다.
- **`memo`만으로 부족할 수 있습니다.** 렌더 중에 문자열을 가공한다면 그 결과의 identity도 지켜야 합니다. `String.replace`는 내용이 같아도 새 문자열을 돌려주니까요.
- **1초마다 리렌더되는 화면은 평소 안 보이던 문제를 드러냅니다.** 카운트다운이나 타이머가 있는 화면에서는 "리렌더돼도 괜찮겠지"가 안 통합니다.
- **외부 HTML을 문자열로 감쌀 때는 감싸는 태그가 원본의 파싱 컨텍스트에서 유효한지 확인해야 합니다.** `<p>` 안이라면 인라인 래퍼가 안전합니다.

처음엔 유튜브 임베드 문제인 줄 알고 iframe API 문서만 한참 봤습니다.  
알고 보니 React가 아주 정직하게 시킨 대로 일하고 있었을 뿐이었죠.

`dangerouslySetInnerHTML`이라는 이름이 왜 저렇게 무섭게 지어졌는지 조금 알 것 같았습니다.
