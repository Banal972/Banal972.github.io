---
title: 필수인 타입스크립트 유틸리티 타입
date: 2024-09-05
categories: [Discover]
tags: [Discover]
---

### 유틸리티 타입?
기초의 타입스크립트만 배우다보면 타입정리가 하나도 되어있지 않거나 지저분한것을 많이 느낄수 있을겁니다.
이러면 나중에 타입을 확인하기 어렵고 까다로우며 에러만 사라지면 되는 느낌으로 타입을 작성하는 자신을 볼 수 있습니다.

이러한 고충을 해결하기 위해서 나온것이 타입스크립트의 유틸리티 타입 입니다.

오늘은 여러 많은 유틸리티 타입중에 자주 사용하거나 개인적으로 많이 사용하는것을 위주로 작성해볼려고 합니다.

<br/>

### Partial
Partial은 객체의 모든 프로퍼티를 선택적(optional)으로 할 수 있게 만듭니다.

기본적으로
```jsx
type Partial<T> = {
    [P in ketof T]? : T[P];
}
```
이런식으로 선택적으로 변경한 새로운 타입을 생성하게 됩니다.

**예시**
```jsx 
interface People {
    age : number;
    name : string   
}

type MyAge = Partial<People>

const my1 : MyAge = {}
const my2 : MyAge = {age : 10}
const my3 : MyAge = {name : "asdsad",age: 5}

```

<br/>

### Omit
Omit는 특정 속성만 제거한 타입을 정의합니다.

```jsx

interface People {
    age : number;
    name : string   
}

const age : Omit<People,"name"> = 0

```

<br/>

### Pick
Pick은 특정 속성만 가져옵니다. Omit의 반대라고 생각 하시면 됩니다.

```jsx

interface People {
    age : number;
    name : string   
}

const age : Pick<People,"age"> = 0

```


이렇게 제가 자주 사용하는 3가지의 유틸리티 함수를 소개 해드렸습니다.

유틸리티 함수는 3가지를 제외하고 여러개 더 있기 때문에 본인에게 맞는 유틸리티 함수를 사용하면 될 것 같습니다.