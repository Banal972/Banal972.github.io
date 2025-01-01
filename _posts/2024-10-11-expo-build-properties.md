---
title: expo-build-properties를 이용한 expo 빌드 최적화
date: 2024-10-11
categories: [Discover, native]
tags: [Discover]
---

#### 개요
Expo를 이용하여 빌드를 할려고 했을때 용량이 생각보다 크게 나오는것을 발견했습니다.
기본적으로 Expo는 Native의 개발 편의성을 극대화 하고 빌드 시 포함되는 설정들이 많기에 빌드의 용량이 클수밖에 없다는것을 알게 되었고
최적화하는 방법을 찾아보았을때 expo-build-properties를 발견할 수 있었습니다.

<br/>

#### expo-build-properties란?

expo-build-properties는 Expo 프로젝트의 빌드 환경을 설정하는데 도와주는 패키지 입니다.

해당 패키지는 다양한 최적화 옵션들을 제공합니다.

해당 옵션들을 [docs](https://docs.expo.dev/versions/latest/sdk/build-properties/?redirected) 에서 확인 가능합니다.


`npx expo install expo-build-properties`로 **expo-build-properties**를 설치하고

app.json에서 해당 빌드 설정을 해주면 됩니다.
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            // 안드로이드 빌드 설정
          },
          "ios": {
            // 아이폰 빌드 설정
          }
        }
      ]
    ]
  }
}
```
이렇게 expo-build-properties 패키지는 불필요한 패키지를 제거하고 asset 같은 리소스를 최적화 하여 빌드 용량을 줄여 배포 속도를 높여줍니다.---
title: 'expo-build-properties를 이용한 expo 빌드 최적화'
desc: '개인 프로젝트(Slid To Do)를 진행하면서 겪은 문제를 정리한 것입니다.'
thumbnail: ''
tags:
  - native
date: 2024-10-11 13:54:44
---

#### 개요
Expo를 이용하여 빌드를 할려고 했을때 용량이 생각보다 크게 나오는것을 발견했습니다.
기본적으로 Expo는 Native의 개발 편의성을 극대화 하고 빌드 시 포함되는 설정들이 많기에 빌드의 용량이 클수밖에 없다는것을 알게 되었고
최적화하는 방법을 찾아보았을때 expo-build-properties를 발견할 수 있었습니다.

<br/>

#### expo-build-properties란?

expo-build-properties는 Expo 프로젝트의 빌드 환경을 설정하는데 도와주는 패키지 입니다.

해당 패키지는 다양한 최적화 옵션들을 제공합니다.

해당 옵션들을 [docs](https://docs.expo.dev/versions/latest/sdk/build-properties/?redirected) 에서 확인 가능합니다.


`npx expo install expo-build-properties`로 **expo-build-properties**를 설치하고

app.json에서 해당 빌드 설정을 해주면 됩니다.
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            // 안드로이드 빌드 설정
          },
          "ios": {
            // 아이폰 빌드 설정
          }
        }
      ]
    ]
  }
}
```
이렇게 expo-build-properties 패키지는 불필요한 패키지를 제거하고 asset 같은 리소스를 최적화 하여 빌드 용량을 줄여 배포 속도를 높여줍니다.
---
title: 'expo-build-properties를 이용한 expo 빌드 최적화'
desc: '개인 프로젝트(Slid To Do)를 진행하면서 겪은 문제를 정리한 것입니다.'
thumbnail: ''
tags:
  - native
date: 2024-10-11 13:54:44
---

#### 개요
Expo를 이용하여 빌드를 할려고 했을때 용량이 생각보다 크게 나오는것을 발견했습니다.
기본적으로 Expo는 Native의 개발 편의성을 극대화 하고 빌드 시 포함되는 설정들이 많기에 빌드의 용량이 클수밖에 없다는것을 알게 되었고
최적화하는 방법을 찾아보았을때 expo-build-properties를 발견할 수 있었습니다.

<br/>

#### expo-build-properties란?

expo-build-properties는 Expo 프로젝트의 빌드 환경을 설정하는데 도와주는 패키지 입니다.

해당 패키지는 다양한 최적화 옵션들을 제공합니다.

해당 옵션들을 [docs](https://docs.expo.dev/versions/latest/sdk/build-properties/?redirected) 에서 확인 가능합니다.


`npx expo install expo-build-properties`로 **expo-build-properties**를 설치하고

app.json에서 해당 빌드 설정을 해주면 됩니다.
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            // 안드로이드 빌드 설정
          },
          "ios": {
            // 아이폰 빌드 설정
          }
        }
      ]
    ]
  }
}
```
이렇게 expo-build-properties 패키지는 불필요한 패키지를 제거하고 asset 같은 리소스를 최적화 하여 빌드 용량을 줄여 배포 속도를 높여줍니다.