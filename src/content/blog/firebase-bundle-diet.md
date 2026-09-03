---
title: "import 한 줄 때문에 모든 방문자가 Firebase SDK를 받고 있었습니다"
date: 2026-08-26
categories: ["Nextjs"]
tags: ["번들 최적화", "Firebase", "성능 최적화", "서비스워커"]
---

푸시 알림을 붙이고 나서 초기 로딩이 눈에 띄게 무거워졌습니다.

이상한 건 **알림을 안 쓰는 사용자도, 로그인조차 안 한 방문자도 똑같이 느려졌다**는 점이었습니다.  
알림 기능을 붙였는데 왜 알림과 상관없는 사람까지 느려질까요?

범인은 `import` 한 줄이었습니다.

---

## 무슨 일이 있었나

푸시 토큰을 다루는 훅이 앱 진입점에서 전 페이지 공통으로 돌고 있었습니다.  
그리고 그 훅의 첫 줄이 이랬습니다.

```ts
import { getPushNotificationTokenIfGranted } from "@/lib/push/messaging";
```

평범해 보이시죠. 저도 그랬습니다.

문제는 `messaging.ts`가 `firebase/app`과 `firebase/messaging`을 **정적으로** import하고 있었다는 것입니다. 그러니까 의존 관계가 이렇게 이어집니다.

```
AppInit → use-push-notification-token → messaging.ts → firebase/app + firebase/messaging
```

진입점에서 도는 코드가 Firebase를 참조하니, 번들러 입장에서는 선택의 여지가 없습니다.  
**Firebase SDK 전체가 `_app` 공통 청크에 실립니다.**

모든 페이지, 모든 방문자가 이걸 내려받고 파싱합니다. 알림 권한을 실제로 허용한 사람은 극소수인데도요.

---

## 왜 이런 게 눈에 안 보일까

번들 경계는 **코드를 봐서는 안 보이기 때문**입니다.

`import` 문은 어느 파일에서 쓰든 생김새가 똑같습니다. 이 한 줄이 청크 하나를 통째로 끌어오는지, 아니면 유틸 함수 하나만 가져오는지 소스에는 아무 표시가 없죠.

게다가 훅 안에서는 **조건부로** 쓰고 있었습니다.

```ts
if (!isNotificationPermissionGranted()) {
  return;
}
// 여기서만 firebase 함수를 호출
```

"어차피 권한 없으면 실행 안 되니까 괜찮겠지" 싶지만, **번들러는 실행 흐름이 아니라 import 그래프를 봅니다.** 호출을 안 해도 파일 최상단에 import가 있으면 청크에는 들어갑니다.

---

## 어떻게 고쳤나

### 1. 모듈을 "Firebase가 필요한가"로 쪼갰습니다

핵심은 파일 단위 분리였습니다.

서비스워커 등록이나 푸시 지원 여부 판별은 Firebase가 전혀 필요 없는 코드입니다.  
그런데 같은 파일에 있으면 같이 딸려옵니다.

그래서 Firebase가 필요 없는 코드만 별도 모듈로 떼어냈습니다.

```ts
/**
 * 서비스워커 등록과 푸시 지원 여부 판별처럼 firebase 를 필요로 하지 않는 코드만 모은다.
 *
 * 이 모듈이 `messaging.ts` 에서 떨어져 나온 이유는 번들 때문이다.
 * `registerServiceWorker` 는 앱 진입 시점에 무조건 호출되는데, 예전처럼
 * `messaging.ts` 에 같이 있으면 그 import 하나가 firebase/app + firebase/messaging 을
 * 공통 청크로 끌어와 모든 페이지가 firebase SDK 를 받고 파싱하게 된다.
 */
```

그리고 반대편 파일 상단에도 규칙을 적어뒀습니다.

```ts
/**
 * 이 모듈은 firebase SDK 를 정적으로 끌어온다.
 * 따라서 절대 최상위(정적) import 로 참조하지 말고, 푸시가 실제로 필요한 시점에
 * `await import('@/lib/push/messaging')` 으로만 접근한다.
 */
```

주석이 좀 장황해 보이지만, 저는 이게 꼭 필요하다고 생각합니다.  
**무심코 정적 import 한 줄이면 원상복구되기 때문**입니다. 그리고 그 실수는 리뷰에서도 잘 안 보입니다.

### 2. 값싼 판별을 먼저, 비싼 로드를 나중에

분리했으면 실제 호출도 미뤄야 합니다.

```ts
// 이 훅은 전 페이지 공통으로 돈다. firebase SDK 를 정적으로 import 하면
// 공통 청크에 통째로 실려 모든 방문자가 대가를 치르므로 동적 import 로 미룬다.
if (!isNotificationPermissionGranted()) {
  return;
}

void import("@/lib/push/messaging")
  .then(({ getPushNotificationTokenIfGranted }) =>
    getPushNotificationTokenIfGranted(),
  )
  .then((token) => {
    /* ... */
  });
```

여기서 `isNotificationPermissionGranted()`는 이게 전부입니다.

```ts
/** 알림 권한이 이미 허용된 상태인지. firebase 를 로드하기 전에 값싸게 걸러내는 용도다. */
export function isNotificationPermissionGranted() {
  return getNotificationApi()?.permission === "granted";
}
```

`Notification.permission` 한 줄로 대부분의 방문자를 걸러냅니다.  
사용자가 알림 토글을 직접 누르는 순간도 마찬가지로 처리했습니다.

```ts
// 사용자가 버튼을 누른 시점에만 firebase 를 로드한다.
const { requestPushNotificationToken } = await import("@/lib/push/messaging");
const token = await requestPushNotificationToken();
```

---

## 곁들이기 1 - `next/font`는 weight마다 preload를 내보냅니다

같은 작업을 하면서 폰트도 들여다봤는데, 여기도 비슷한 함정이 있었습니다.

`next/font/local`은 **선언한 `src` 항목을 전부 `<link rel="preload">`로 내보냅니다.**

저는 폰트 패밀리를 통째로 선언해두는 습관이 있었습니다. 100부터 900까지 다 적어두면 나중에 필요할 때 바로 쓸 수 있으니까요.

그런데 그렇게 하면 **안 쓰는 weight까지 매 페이지 preload 대상**이 됩니다.

```ts
// next/font 는 선언한 src 를 전부 <link rel="preload"> 로 내보낸다.
// 따라서 여기 적는 weight 하나하나가 모든 페이지의 초기 로드 비용이 된다.
// 실제로 쓰는 weight 만 남긴다.
const pretendard = localFont({
  src: [
    {
      path: "…/Pretendard-Regular.subset.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "…/Pretendard-Medium.subset.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "…/Pretendard-SemiBold.subset.woff2",
      weight: "600",
      style: "normal",
    },
    { path: "…/Pretendard-Bold.subset.woff2", weight: "700", style: "normal" },
    {
      path: "…/Pretendard-ExtraBold.subset.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});
```

실제 참조처를 찾아보니 100/200/300/900은 쓰는 곳이 한 군데도 없었습니다. 전부 지웠습니다.

특정 화면에서만 쓰는 폰트는 아예 preload를 껐습니다.

```ts
// 이 폰트는 일부 안내 화면의 키워드에서만, 그것도 700 하나만 쓴다.
// 전 페이지에서 preload 할 이유가 없으므로 해당 화면에 들어갔을 때만 받게 한다.
const displayFont = localFont({
  src: [{ path: "…/display-bold.woff2", weight: "700", style: "normal" }],
  variable: "--font-display",
  display: "swap",
  preload: false,
});
```

`preload: false`가 **폰트를 안 쓴다는 뜻은 아닙니다.** 초기 preload 링크를 안 넣는다는 뜻이고, 해당 화면에서 실제로 필요해지면 그때 받습니다.

---

## 곁들이기 2 - 서비스워커에 빌드 타임 env 넘기기

`sw.js`는 `public/`에 있는 정적 파일이라 **번들러를 거치지 않습니다.**  
그래서 `process.env`를 못 읽습니다.

등록 URL의 쿼리스트링으로 넘겼습니다.

```ts
// sw.js 는 정적 파일이라 빌드 타임 env 를 못 읽으므로 쿼리로 주입한다.
// 모든 register 호출이 동일한 URL 을 써야 스코프(/)에 단일 등록이 유지된다.
const SERVICE_WORKER_URL = `/sw.js?apiBaseUrl=${encodeURIComponent(
  API_BASE_URL,
)}&icon=${encodeURIComponent(site.brand.icon192)}`;
```

`sw.js` 안에서는 `new URL(self.location).searchParams`로 읽으면 됩니다.

**함정은 "모든 register가 동일한 URL이어야 한다"**는 것입니다.

브라우저는 서비스워커를 **스크립트 URL 기준으로 식별**합니다. 어떤 경로에서는 `?apiBaseUrl=A`로, 다른 경로에서는 `?icon=B`만 붙여서 등록하면 **같은 스코프에 다른 워커가 중복 등록**됩니다.

그래서 URL을 상수 하나로 만들어 모든 호출이 공유하게 했습니다.

---

## 곁들이기 3 - 서비스워커는 권한과 무관하게 등록합니다

직관적으로는 "알림 권한을 받은 뒤에 서비스워커를 등록"하는 게 맞아 보입니다. 저도 처음엔 그렇게 생각했고요.

그런데 반대로 했습니다.

```ts
/**
 * 알림 권한과 무관하게 앱 로드 시점에 서비스워커를 등록한다.
 * PWA 설치 가능(installability) 기준 충족 → web/Android 에서
 * `beforeinstallprompt` 발생을 위해 필요하다.
 */
```

PWA 설치 프롬프트가 뜨려면 **서비스워커가 등록돼 있어야** 합니다.  
알림과 설치는 완전히 별개 기능인데 같은 전제를 공유하고 있는 거죠.

알림 권한을 기다리면 설치 프롬프트를 놓칩니다.

그리고 여기서 앞의 분리가 다시 빛을 봅니다. `registerServiceWorker`는 Firebase가 필요 없는 쪽에 있으니, 진입 시점에 무조건 호출해도 SDK를 끌어오지 않습니다.

---

## 곁들이기 4 - 알림이 두 번 뜨는 함정

`sw.js`를 Firebase SDK의 서비스워커 코드를 쓰지 않고 raw `push` 이벤트를 직접 처리하도록 짰습니다.

그러면 탭이 떠 있든 아니든 **항상 서비스워커가 알림을 띄웁니다.**

이 상태에서 포그라운드 `onMessage` 핸들러가 `showNotification`을 또 호출하면 알림이 두 번 뜹니다.

```ts
/**
 * 알림 표시는 하지 않는다. sw.js 는 firebase SDK 의 SW 코드를 쓰지 않고
 * raw `push` 이벤트를 직접 처리하므로, 탭이 떠 있든 아니든 항상 SW 가 알림을 띄운다.
 * 여기서 showNotification 을 또 호출하면 알림이 두 번 뜬다.
 */
```

**"누가 알림을 띄우는가"를 한 곳으로 정해두지 않으면** 포그라운드와 백그라운드 경계에서 중복이 납니다.

---

## 정리

- **import 한 줄이 공통 청크를 결정합니다.** 진입점에서 도는 코드가 무거운 SDK를 정적으로 참조하면 전 방문자가 그 비용을 냅니다. 저처럼 "조건부로만 호출하니까 괜찮겠지" 하고 넘어가면 안 됩니다.
- **번들 경계는 파일 경계로 만들어두는 게 안전하더라고요.** "이게 필요한 코드"와 "아닌 코드"를 파일로 나눠두면 실수로 다시 끌어오기가 어려워지니까요.
- **파일 상단에 접근 규칙을 적어뒀습니다.** 번들 경계는 코드만 봐서는 안 보이거든요. 주석이라도 없으면 다음에 만지는 사람이 알 방법이 없죠.
- **값싼 판별을 먼저, 비싼 로드를 나중에.** `Notification.permission` 한 줄로 대부분의 방문자를 걸러낼 수 있었습니다.
- **`next/font`는 `src` 항목 하나하나가 preload입니다.** 저는 폰트 패밀리를 통째로 선언해두는 습관이 있었는데, 이번에 실제로 쓰는 것만 남기고 특정 화면 전용은 `preload: false`로 내렸습니다.

기능을 하나 붙일 때는 아무래도 **그 기능을 쓰는 사람**만 생각하게 됩니다.  
알림을 켠 사람한테 푸시가 잘 가는지, 토큰이 잘 저장되는지 같은 것들이요.

그런데 이번에 확인해 보니, 알림을 한 번도 켠 적 없는 사람도 Firebase SDK를 그대로 내려받고 있었습니다.  
로그인조차 안 한 방문자까지요.

**기능은 일부만 쓰는데 그 기능의 무게는 전부가 나눠 지고 있었던 셈입니다.**

그래서 요즘은 새 SDK를 하나 붙일 때마다 "이게 어느 청크에 들어가지?"를 한 번씩 물어보고 있습니다.
