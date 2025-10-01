---
title: 뭐? Styled-Components가 끝났다고? 성능을 40% 개선한 Fork 이야기
date: 2025-10-02
categories: [React]
tags: [styled-components, React, 성능 최적화, CSS-in-JS]
---

제목을 보고 놀라신 분들이 많을 거라 생각합니다. 저 역시 그랬으니까요.

오늘은 해외 포스팅 하나를 깊이 있게 요약하고, 그 원본을 공유하고자 합니다.

## 개요 - 논쟁의 중심에 선 styled-components
최근 **React 개발자들 사이에서 핵심 쟁점**으로 떠오르는 것은 `styled-components`의 미래 라고 생각됩니다. 공식 관리자 조차 "새 프로젝트에는 권하지 않는다" 라고 권고를 하고 있지만, 이 라이브러리가 이미 수 많은 프로덕션 코드베이스를 차지하고 있습니다.

---

## styled-components의 현재 상황과 성능 저하의 두 가지 원인
`styled-components`에서 발생하는 성능적인 문제는 크게 두 가지로 나눌 수 있습니다.
1. React 아키텍처(RSC)와의 충돌
`styled-components`는 실행 시간에 스타일을 동적으로 주입하는 CSS-in-JS 방식입니다. 반면 React18, 19의 아키텍처(RSC: React Server Components 등)는 **정적(Static) CSS**를 지향합니다.

이러한 방식의 불일치 때문에, `styled-components`는 스타일이 주입될 때마다 레이아웃 재계산(Layout Recalculation)이 **반복되는 성능 저하 사이클**이 만들게 됩니다.

2. `useInsertionEffect` 누락으로 인한 최적화 이슈 
React 18 부터 동적 스타일 주십 시에 발생하는 문제를 해결하기 위해 `useInsertionEffect`라는 훅이 도입되었습니다. 이 훅은 스타일 주입을 **렌더링 직후, 레이아웃 계산 직전**으로 옮겨 불필요한 재계산을 막아주는 훅입니다.

하지만 `styled-components`는 이 핵심적인 최적화를 제때 적용하지 못했고, 심각한 성능 문제는 해결되지 않은 채 방치 되어버렸습니다.

---

## 헤드리스 CMS 솔루션인 Sanity가 최후의 성능개선을 Fork 했다?

Sanity팀은 수천 개의 컴포넌트가 이미 `styled-components`로 묶여 있었고 총 세 가지 선택지에 직면했습니다.
1. **전면 재작성**
2. **성능 저하 감수**
3. **직접 수정**

Sanity는 결국 3번을 선택했습니다. `styled-components`의 최신 버전을 기반으로 **직접 Fork**해서 핵심 개선을 적용했습니다.

### 최적화 이슈인 `useInsertionEffect`를 구현
가장 중요했던 `useInsertionEffect` 구현하여 React 18 이후 환경에서 스타일 주입이 효율적으로 일어나도록 하여, Sanity사의 Sanity Studio의 초기 렌더링 성능을 최대 40% 까지 향상 시키는 결과물을 얻었다고 합니다. 실제로 Linear 팀이 해당 Fork을 사용해서 엄청난 성능 향상을 확인했다고 하죠

### React 19 및 SSR 지원
원래 라이브러리가 지원하지 않던 React 19의 **SSR**까지 지원하도록 코드를 업데이트 했다고 합니다.

### 모던 Javascript 빌드

빌드 결과물을 구형 **ES5에서 모던 JavaScript(ES2020)**로 전환하여, 전체적인 번들 사이즈와 실행 속도를 개선했습니다.

----

### 해결책은 아니다?
해당 Fork는 Sanity팀이 `styled-components-last-resort` 라고 명명한 만큼 임시방편 이라고 생각해야합니다.

`styled-components`로 이미 많은 컴포넌트를 구현했던 Sanity팀마저 `styled-components`를 포기하고 `vanilla-extract`와 같은 **정적 CSS 라이브러리**로의 마이그레이션을 진행하고 있다고합니다.

해당 Fork는 수개월이 걸릴 마이그레이션 기간 동안 **기존 레거시 코드의 성능을 유지하고 개선**하기 위해서 잠시 구명 조끼를 입은것 뿐이라고 합니다.

### 결론 - 이제는 정적 CSS를 고민하자
이미 많은 기업이 `styled-components`를 이용해서 프로젝트를 구현해 왔을 것입니다. 하지만 `styled-components` 관리자도 이제 공식적으로 **유지보수 모드**로 전환되었다고 선언한 만큼 **새로운 기능 개발은 이제 없을것** 입니다.

따라서 기존 코드를 당장 바꿀수 없다면 Sanity의 Fork와 같은 **응급 처치**를 고려하되, 이제는 CSS-in-JS보다는 정적 CSS로 구현을 해보는것은 어떨까요?

---

[참고 원문]
이 글은 Sanity.io의 블로그 포스팅 **"Cut styled-components into pieces: This is our last resort"**를 참고하여 핵심 내용을 요약 및 재구성했습니다. 자세한 기술적 내용과 Fork는 원문 링크를 참고해 주세요!

원본 링크: [https://www.sanity.io/blog/cut-styled-components-into-pieces-this-is-our-last-resort?utm_source=substack&utm_medium=email](https://www.sanity.io/blog/cut-styled-components-into-pieces-this-is-our-last-resort?utm_source=substack&utm_medium=email)