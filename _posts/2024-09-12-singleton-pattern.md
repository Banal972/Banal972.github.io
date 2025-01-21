---
title: 싱글턴 패턴 과 Zustand
date: 2024-09-12
categories: [Discover,React]
tags: [Discover,React,Design-pattren]
---

### 개요
싱글턴 패턴을 구축하고 상태관리 라이브러리와 같이 사용하면서 메모리 사용을 줄이고 테스트와 성능 최적화를 하는것을 자주 사용하는것 같아
싱글턴 패턴을 알아보고 구현과 zustand를 조합해서 컴포넌트 개발을 한번 해볼려고 합니다.


### 싱글턴 패턴이란?
싱글턴 패턴은 Class로 만든 인스턴스가 오직 하나만 생성되도록 만드는 디자인 패턴입니다.

예를 한번 들어보겠습니다
```js
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  sayHello {
    console.log(`안녕 나는 ${this.name} 이고 나이는 ${this.age}야`);
  }
}
```
라는 간단한 클래스가 있다고 있을때

```js
const Person1 = new Person();
const Person2 = new Person();

Person1 === Person2; // false
```
이렇게 있을때 new를 이용해서 새로운 객체를 생성하기 때문에 서로 비교 했을경우 false이 나옵니다.
하지만 싱글턴 패턴을 이용하면 항상 같은 객체가 나오게끔 할 수 있게 됩니다.

만드는 방법은 굉장히 간단합니다.

```js
class Person {
  static instance;
  constructor(name, age) {
    if(Person.instance){
      return Person.instance;
    }
    this.name = name;
    this.age = age;
    Person.instance = this;
  }
  sayHello {
    console.log(`안녕 나는 ${this.name} 이고 나이는 ${this.age}야`);
  }
}
```
`instance` 속성을 만들어주고 `constructor`에 `Person.instance = this;` 를 넣어주게 되면 처음 `new Person()`을 하게 될때 `Person.instance` 안에 `this`가 들어가게 됩니다.
그리고 조건문으로 `Person.instance`가 존재하면 `Person.instance`를 `return` 하게 해주면 항상 같은 인스턴스를 반환하게 됩니다.


```js
const Person1 = new Person()
const Person2 = new Person()

Person1 === Person2 // true
```

이 방식을 싱글턴 패턴이라고 합니다.
이것을 이용해서 싱글턴으로 `store`를 생성하고 `Zustand`와 조합 하는것을 작성해볼려고 합니다.

<br/>
싱글턴으로 만든 store
```js
class CounterState {
  static instance;
  constructor() {
    if (!CounterState.instance) {
      return CounterState.instance
    }
    this.state = {
      count: 0,
    };
    CounterState.instance = this
  }

  reset() {
    this.state.count = 0;
  }

  inc() {
    this.state.count += 1;
  }

  dec() {
    this.state.count -= 1;
  }

  getState() {
    return this.state;
  }
}
```

주스탄드와 조합한 모습
```js
import create from 'zustand';

const counterState = new CounterState();

const useCounter = create((set) => ({
  ...counterState.getState(),
  inc: () => {
    counterState.inc();
    set(counterState.getState());
  },
  dec: () => {
    counterState.dec();
    set(counterState.getState());
  },
  reset: () => {
    counterState.reset();
    set(counterState.getState());
  },
}));

export default useCounter;
```

이렇게 구현하게 되면 불필요한 메모리 사용을 방지할 수 있고 전역으로 접근하기 쉬워지며 일관성을 유지하고
상속이 가능해지기 때문에 유연성이 높아지고 메모리 효율성이 좋아집니다.

실무에서 이런 방식으로 구현을 한다는데 정말인지는 모르겠고 학습 용도로 작성해 보았습니다.