---
title: Typescript는 왜 go를 선택했을까
date: 2025-03-13
categories: [Discover]
tags: [Discover]
---

### Typescript란?
Typescript는 Javascript 의 superset으로 Microsoft에서 만든 자바스크립트 언어 입니다.

최근에 Microsoft는 하나의 발표를 했는데 기존 Typescript의 자체 컴팡일러 tsc 방식을 두고 go을 이용해서 컴파일을 시도했고 결국 10배 이상이 빠른 속도로 컴파일되는것을 보여주었습니다.

### 왜 많은 언어중에 GO를?
저는 요즘들어 Rust를 많이 사용한다는것을 알고있지만 그 외 수많은 언어를 두고 왜 Go을 선택했을까? 라는 생각이 들어서 찾아보았습니다.

Microsoft에서는 많은 언어를 두고 고민을 해왔던것 같습니다. 여러 단어로 다양한 데이터 표현을 실험하기 위해서 프로토타입을 여러 작성하였고, swc와 esbuild같은 기존 네이티브 Typescript Parser에서 사용하는 접근 방식을 조사 해왔고

그 중 Go가 가장 좋은 결과를 나타냈던것 같습니다.

Go는 코드베이스 메모리 관리에 지속적으로 신경 쓸 필요 없이 객체, 필드 수준에서 메모리 레이아웃과 할당을 탁월하게 제어 할 수 있었다고 합니다. 이 부분은 가비지 컬렉터를 의미하게 되는데 typescript 코드베이스 역시 가비지 컬렉터가 문제될것은 없었어서 개발이 더 편리하고 효율적이였다는 겁니다.

또한 다형성 노드를 포함하는 위, 아래 트리를 횡단하는 등 그래프 처리량이 비정상적으로 많았는데 Go는 인체공학적으로 만드는데 탁월한 능력을 보여주었다고 합니다.

### 단점은 뭘까?
하지만 몇 가지 취약점은 존재하는데 Go의 Javascript 인터롭이 다른 대안들보다 좋지 않다는게 단점으로 다가왔고 특히 API는너무 열려 있어 일부 최적화에 제약이 있었다는겁니다.

이 부분들은 개선하기 위해 계획이 예정 되어있고 JS API를 제공하기 위해서 최선을 다하고 있다고 합니다.

사용자에게 피해 없이 내부적으로 성능을 최적화 할 수 있도록 문을 열어두겠다고 합니다.

앞으로는 더 깔끔하고 효율적인 API로 개성되어 성능이 더 좋아지고, 개발도 쉬워질것이라고 생각하고 있답니다.

저는 기대해봐도 좋을것 같아요!

### 참고 영상
<iframe width="560" height="315" src="https://www.youtube.com/embed/pNlq-EVld70?si=_Dqi_c5kox0lmpE2" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>