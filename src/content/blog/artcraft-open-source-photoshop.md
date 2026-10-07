---
title: "포토샵이 오픈소스로 나왔다고? ArtCraft 직접 써본 후기"
date: 2026-10-07
categories: ["Blog"]
tags: ["ArtCraft", "PhotoCraft", "Photoshop", "Rust", "AI", "오픈소스"]
---

요즘은 어떤일이 있나 보다 이런 글이 자주 보였습니다.

> AI가 4일 만에 포토샵을 만들었다

처음에는 그냥 또 과장된 이야기겠지 하고 넘겼는데, 찾아보니 실제로 **PhotoCraft**라는 포토샵의 기능을 거의 지원하는 에디터가 오픈소스로 공개되어 있었습니다.

그리고 이걸 만든 곳이 **ArtCraft**라는 팀이었고, 포토샵뿐만 아니라 Adobe 제품군 대부분을 대체하겠다는 앱들을 갑자기 한꺼번에 공개했습니다.

그래서 얼마나 비슷한가 싶어 궁금해서 직접 설치해서 써봤습니다.

## ArtCraft는 원래 AI 이미지/영상 툴이었습니다

원래 ArtCraft는 **AI 이미지와 영상을 만드는 데스크톱 앱**이었습니다.

프롬프트만 입력하는 방식이 아니라 3D로 구도를 잡거나 캐릭터 포즈를 잡아서 AI 결과물을 좀 더 직접 컨트롤할 수 있게 만든 툴입니다.

<div style="text-align: left;">
    <img src="/assets/img/post/2026-10-07-artcraft-open-source-photoshop/1.webp" alt="ArtCraft 메인 화면" width="700" />
</div>

그런데 최근에 같은 팀이 **Crafting Apps**라는 이름으로 Adobe 제품을 대체하는 앱들을 공개했습니다.

```text
ArtCraft
↓
AI 이미지 / 영상 생성 툴 (기존)

Crafting Apps
↓
Adobe 대체 앱 모음 (이번에 화제가 된 것)
```

그래서 "ArtCraft가 포토샵을 만들었다"는 말은 정확히는 **ArtCraft 팀이 만든 PhotoCraft**를 이야기하는 겁니다.

## Crafting Apps에는 총 7개의 앱이 있습니다

<div style="text-align: left;">
    <img src="/assets/img/post/2026-10-07-artcraft-open-source-photoshop/2.webp" alt="ArtCraft Crafting Apps 페이지" width="700" />
</div>

| 앱          | 대체하려는 것 | 상태      |
| ----------- | ------------- | --------- |
| PhotoCraft  | Photoshop     | 초기 알파 |
| VectorCraft | Illustrator   | 개발 중   |
| FilmCraft   | Premiere      | 개발 중   |
| LightCraft  | Lightroom     | 개발 중   |
| PrintCraft  | Acrobat       | 초기 알파 |
| EffectCraft | After Effects | 개발 중   |
| DesignCraft | InDesign      | 개발 중   |

7개의 제품의 공통적인 특징은 이렇게 됩니다.

- 전부 **Rust**로 작성된 네이티브 앱 (Electron이나 웹뷰가 아님)
- macOS, Windows, Linux 지원 + 브라우저(WebAssembly)에서도 실행 가능
- **MIT / Apache-2.0** 라이선스로 무료
- 클라우드 없이 로컬에서 동작
- CLI, JSON, **MCP 서버**로 앱을 조작 가능

심지어 MCP도 지원하는것에 흥미로웠습니다.

## PhotoCraft를 직접 써봤습니다

<div style="text-align: left;">
    <img src="/assets/img/post/2026-10-07-artcraft-open-source-photoshop/e50f39c7-f656-4081-bd7f-bb14da954ac1.webp" alt="PhotoCraft 실행 화면" width="700" />
</div>

처음 실행했을 때 느낌은 솔직히 **그냥 포토샵을 켠 기분**이었습니다.

저는 디자이너는 아니지만, 예전에 PSD로 받은 디자인을 가지고 웹 사이트를 만드는 일을 꽤 많이 해봤습니다.

그래서 포토샵을 어느 정도는 다룰 줄 아는데, 그런 제가 봐도 이건 사실상 포토샵이었습니다.

### 화면이 포토샵이랑 거의 똑같습니다

포토샵과 나란히 띄워놓고 비교해보았고, 사실상 UI는 그냥 **포토샵과 거의 동일**했습니다.

툴바 위치, 상단 옵션바, 오른쪽 레이어 패널까지 배치가 거의 같아서 따로 적응할 게 없었고, 단축키도 대부분 그대로 동작하는 느낌이었습니다.

<div style="text-align: left;">
    <img src="/assets/img/post/2026-10-07-artcraft-open-source-photoshop/photoshop-vs-photocraft.webp" alt="포토샵과 PhotoCraft 비교" width="700" />
</div>

### PSD 파일이 그대로 열립니다

가지고 있던 PSD 템플릿을 실제로 열어봤습니다.

일단 **열리는 속도가 굉장히 빨랐습니다.**

솔직히 열자마자 "어...?" 하는 소리가 나올 정도로 뭐지 싶었습니다.

레이어, 텍스트 레이어, 스마트 오브젝트까지 원본 구조 그대로 들어와 있었습니다.

README 기준으로는 레이어를 유지한 채로 PSD/PSB 파일을 읽고 쓸 수 있다고 합니다.

<div style="text-align: left;">
    <img src="/assets/img/post/2026-10-07-artcraft-open-source-photoshop/photocraft-psd.webp" alt="PhotoCraft에서 PSD 파일을 연 화면" width="700" />
</div>

## 그런데 왜 이렇게 화제가 됐을까?

포토샵 대체재는 사실 예전부터 많았습니다.

GIMP도 있고 Photopea도 있죠.

그런데 이 정도 퀄리티일 거라고는 생각하지 못했습니다.

그리고 무엇보다 화제가 된 건 **만들어진 방식**이었습니다.

7개의 앱이 **2026년 9월 30일 ~ 10월 1일 사이에 한꺼번에 공개**됐는데, 개발에 **Claude Opus 5.5** AI 에이전트 여러 개를 동시에 돌렸다고 알려져 있습니다.

그래서 "AI가 4일 만에 포토샵을 만들었다" 같은 이야기가 돌기 시작했습니다.

## 헷갈리면 안 되는 부분

다만 찾아보면서 몇 가지는 확실히 짚고 넘어가야겠다고 느꼈습니다.

### 1. 포토샵이 오픈소스로 나온 건 아닙니다

Adobe가 포토샵 코드를 공개한 게 아닙니다.

PhotoCraft는 **포토샵을 처음부터 다시 만든 별개의 프로젝트**이고, README에도 Adobe와는 관련이 없다고 적혀 있습니다.

제목에 물음표를 붙인 이유이기도 합니다.

### 2. 클린룸 방식으로 만들었다고 합니다

PhotoCraft는 스스로를 **clean-room reimplementation**이라고 소개합니다.

원본 코드를 보거나 프로그램을 뜯어보지 않고, **공개된 문서와 겉으로 보이는 동작만 보고** 다시 만드는 방식입니다.

```text
Adobe 코드 X
프로그램 뜯어보기 X
공개 스펙 + 관찰한 동작 O
```

### 3. 아직 실무에서 쓰기는 어려울 수 있습니다

PhotoCraft는 아직 **Early alpha** 단계입니다.

README에도 실무에서 매일 쓸 수 있는 포토샵 대체재는 아직 아니라고 직접 적혀 있습니다.

> it is not yet a Photoshop replacement for daily professional work.

그래서 저는 **급할 때 대용으로 쓸 수 있는 정도**라고 생각합니다.

### 4. Adobe가 가만히 있을지는 모르겠습니다

UI부터 단축키까지 이 정도로 똑같으면, Adobe가 이걸 계속 가만히 둘지는 솔직히 장담하지 못하겠습니다.

## 직접 써본 결과

저는 디자이너가 아니라서 장담은 못하겠습니다.

그래도 **PSD를 열어서 어느 정도 수정하는 정도**라면 충분히 쓸 만했습니다.

그 정도 작업 때문에 포토샵 구독료가 아까웠다면, 충분히 고려해볼 만하다고 생각합니다.

## 정리

포토샵 대체재가 나왔다고 해서 가볍게 써봤는데, 생각보다 **퀄리티가 훨씬 좋았습니다.**

그리고 무엇보다 **AI로 이 정도 규모의 소프트웨어를 이렇게 짧은 시간 안에 만들 수 있다**는 게 너무 놀라웠습니다.

지금이 early alpha인데, 몇 달 뒤에는 얼마나 발전해 있을지 오히려 조금 무서워질 정도입니다.

#### 참고

- [ArtCraft Crafting Apps](https://getartcraft.com/apps)
- [ArtCraft GitHub](https://github.com/storytold)
