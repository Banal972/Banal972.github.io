---
title: Next.js에서 SSR을 지원하지 않는 컴포넌트 다루기
date: 2024-06-01
categories: [Discover, Nextjs]
tags: [Discover,Nextjs]
---

### 개요
Next.js를 사용하다보면 React 라이브러리를 설치해서 해당 컴포넌트를 사용하게 될때 SSR를 지원하지 않는다면
오류가 발생합니다.

이것은 Next.js가 SSR 기반으로 각 페이지들을 pre-rendering 하기 때문에 발생하는 것 입니다.

저 같은 @toast-ui/react-editor를 사용할때 발생했습니다.

해당 문제를 해결하는법을 정리해볼려고 합니다.


### SSR을 지원하지 않는 컴포넌트를 불러오면 생기는 오류

예를 들어 Next.js에서 
```tsx
"use client"

import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";

const Home = () => {
    return (
        <div>
            <Editor height="600px" />
        </div>
    );
};

export default Home;
```

해당 @toast-ui를 import해서 가져올경우 오류를 반겨주는데

Next.js에서 SSR로 서버에서 페이지를 pre-rendering 할때 window나 document 전역객체가 선언되지 않아 해당 변수를 참조할 수 없을때 발견되는 현상인데

이 문제를 해결하기 위해서는 next.js에서 지원하는 **next/dynamic**을 사용하면 해결할 수 있습니다.


### next/dynamic

사용하기 앞서 next/dynamic은 React.lazy()와 Suspense를 합쳐 만들었다고 합니다.
앱과 페이지 디렉토리에서 동일한 방식으로 작동하고 점전적인 마이그레이션을 허용한다고 합니다.

next/dynamic에는 옵션으로 `{ssr : boolean}`을 지원합니다.

이 방식으로 SSR을 스킵할수가 있는데 이 방식을 이용해서 오류를 해결 할 수 가 있었습니다.

ssr 옵션을 사용할려면 client Component 상태여야 합니다.

불러오기 전에 컴포넌트를 따로 분리해서 client Component상태로 만들고 next/dynamic을 해서 ssr를 스킵하는 상태로 불러오면 됩니다.


```tsx
// ToastUI 컴포넌트
"use client"

import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";

const ToastUI = ()=> {
    return <Editor height="600px" />
}

return ToastUI;
```

```tsx
// Home
const ToastUI = dynamic(() => import('./ToastUI'), { ssr: false })
const Home = () => {
    return (
        <ToastUI/>
    );
};

export default Home;
```

이렇게해서 ssr 문제를 해결 할 수 있었습니다.



### 후기
Next.js의 Docs를 세세히 읽어보면 금방 해결할 수 있는 문제였습니다.
또한 Docs의 중요성을 느꼈고 use client를 붙여도 pre-rendering을 하기 때문에 제대로된 클라이언트 컴포넌트라고 부르기엔 애매하다고도 느꼇습니다.
dynamic을 해야지 클라이언트 컴포넌트가 되는게 아닌가 싶은 생각도 듭니다.
그리고 ToastUI도 좋지만 최근에 커스터마이징 할 수 있는 Tiptap을 발견해서 해당 라이브러리로 옮길려고 합니다!