---
title: expo에서 firebase sdk가 아닌 native-firebase 설치 이슈
date: 2024-10-27
categories: [Discover, native]
tags: [Discover]
---

### 개요

이번 사이드 프로젝트에서는 백엔드가 없어 Firebase, Supabase 둘 중 어떤것을 사용할까 고민하다 push 알림도 있어 Firebase를 선택하게 되었습니다.

Expo에서 Firebase를 사용할려면 두 가지 방법이 있다는것을 알았습니다.

**Firebase JS SDK**를 사용하거나 **React Native Firebase**를 사용하는 것이였습니다.

### Firebase JS SDK?

Firebase JS SDK는 Firebase에서 웹앱 프로젝트에서 사용하기 쉽게 만들어둔것 입니다.
Native CLI가 아닌 Expo에서는 Firebase JS SDK를 사용할 수 있습니다.

Expo-Go를 이용하기에 설치 또한 어렵지 않습니다.

`npx expo install firebase`로 firebase를 설치해주고

firebase 프로젝트를 생성했다면

```js
// firebaseConfig.js
import { initializeApp } from "firebase/app";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "api-key",
  authDomain: "project-id.firebaseapp.com",
  databaseURL: "https://project-id.firebaseio.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "sender-id",
  appId: "app-id",
  measurementId: "G-measurement-id",
};

const app = initializeApp(firebaseConfig);
```

이렇게 Config을 만들어 initializeApp을 이용해 app에 저장해서 사용하는 방식 입니다.

Metro 구성도 해야합니다.
Expo CLI는 Metro를 사용하기에 JavaScript 코드와 에셋을 묶어 더 많은 파일 확장자에 대한 자원을 추가해줍니다.

`npx expo customize metro.config.js` 명령어를 이용해서 루트 디렉토리에 metro.config.js를 생성하고

```js
const { getDefaultConfig } = require("@expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push("cjs");

module.exports = defaultConfig;
```

이렇게 업데이트를 해주면 Firebase JS SDK를 사용할 준비가 완료 되었습니다.

하지만 Firebase JS SDK는 모바일 앱에 대한 모든 서비스를 지원하지는 않습니다.

예를 들면 **Analytics, Dynamic Links 및 Crashlytics** 가 있는데 Analytics를 모바일 에서 사용하고 싶은 저는 Firebase JS SDK를 사용하지 않고 React Native Firebase를 사용하기로 정했습니다.

### React Native Firebase

React Native Firebase는 Android 및 IOS용 네이티브 SDK를 JavaScript API로 래핑해 네이티브 코드에 대한 엑세스를 제공해주는 패키지 입니다.

사실 굳이 Expo를 사용한다면 React Native Firebase를 사용할 필요는 없습니다.
하지만 Firebase JS SDK가 모바일 앱에서 지원하지 않는것은 분명히 있고 언젠가 그 지원하지 않는것을 사용할때가 올 것 같아서

React Native Firebase를 사용하기로 결정했습니다.

설치방법은 기존 Firebase JS SDK보단 복잡하고 귀찮습니다.

`npx expo install expo-dev-client` 명령어를 입력해서 expo-dev-client를 설치해줍니다.

**expo-dev-client**는 디버그 빌드에 다양하고 유용한 개발 도구를 추가해줍니다.

`npx expo install @react-native-firebase/app`명령어를 사용해 필수로 설치해주시고

app.json를 수정해야 합니다.

```json
//app.json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json", // firebase의 android 설정후 파일
      "package": "com.mycorp.myapp" // 안드로이드 패키지 이름
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist", // firebase의 ios 설정후 파일
      "bundleIdentifier": "com.mycorp.myapp" // ios 패키지 이름
    },
    "plugins": [
      "@react-native-firebase/app",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ]
  }
}
```

app.json의 plugins을 통해 expo에서 firebase를 연결해준다고 생각하면 됩니다.
firebase의 auth와 crashlytics를 사용할경우 똑같이 plugins에 연결해줍니다.

```json
//app.json
{
    ...,
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/crashlytics",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ]
}
```

모든 설정이 끝났다면 `npx expo prebuild --clean`을 사용해서 prebuild를 해주면 app.json과 package.json을 통해서 prebuild를 해주고 `npx expo run:android` 혹은 `npx expo run:ios`로 시뮬레이터를 연결해 작업을 하면 됩니다.

이 방법은 Expo-Go를 사용하지 않고 Native를 사용하기 때문에 prebuild가 꼭 필요합니다.

만약 Analytics,firestore등 여러가지 firebase의 기능들은 https://rnfirebase.io/#managed-workflow를 참고해야합니다.

예를 들어 firestore는 app.json의 plugins에 연결하면 prebuild오류가 발생하기 때문에 넣으면 안됩니다.
package.json 기준으로 prebuild시에 알아서 잘 설정이 됩니다.

### 후기

expo 기준으로만 다 만들었기에 native기반의 패키지를 설치할때 조금 많이 해맸고 React Native Firebase를 설치하면서 이해를 하게되면서 이게 왜 오래 걸렸나 싶을정도로 간단했습니다.
expo도 좋지만 React Native를 조금 더 이해하는 시간이 필요할것 같다는 생각이 들었습니다.
