---
title: 바닐라 자바스크립트로 React Input 이벤트 Trigger 하기
date: 2025-01-01
categories: [Discover, Javascript]
tags: [Discover,Javascript]
---

### 문제
프로젝트를 진행중에 있어 Javascript를 이용하여 React의 input의 value값이 state로 관리가 되어있기 때문에 <br/> 일반 `document.getElementById('aaa').value = "input값"` 형식으로는 <br/> 가상DOM을 쓰는 React에서 DOM이 변형되면 값이 제대로 저장되지 않는 문제가 발생했습니다.

### 문제 해결에 대한 걸음
이 문제를 해결하기 위해서는 일단 javascript의 `dispatchevent`을 알아야합니다.

#### dispatchevent
dispatchevent 이벤트는 EventTarget 객체로 Event를 발송해, 해당 이벤트가 등록되어 있는 EventListener들을 순서대로 호출해줍니다.
dispatchevent()을 호출하기 위해서는 Event() 생성자를 이용하여 이벤트를 생성 및 초기화를 진행하고
dispatchevent(event)에 담아서 호출해줍니다.

#### React의 input이벤트 트리거
저는 dispatchevent 발생시키기 위해서 이런한 방법을 사용했습니다.

```js
const input = document.querySelector('input');
input.value = newValue;
const event = new Event('input', { bubbles: true });
event.simulated = true;
input.dispatchEvent(event);
```
이 방식은 input을 가져오고 value을 수정해준 다음 input 이벤트를 만들어서 해당 input 이벤트에 event를 걸어주는겁니다.
`event.simulated`가 true인 이유는 저도 아직 잘 이해를 하지못해 <br/>
[참고](https://github.com/cypress-io/cypress/issues/536#issuecomment-308739206) 해당부분을 참고하면 좋을것 같습니다.

이 방식을 사용해도 적용이 되지 않는 경우가 발생합니다. 이는 React 버전이 15.6.0 이하일때만 사용이 가능하며

React버전이 15.6.1 이상일 경우 이 방식을 사용해야 합니다.

```js
const input = document.querySelector('input');
input.value = newValue;
const nativeInputSetter = Object.getOwnPropertyDescriptor(
window.HTMLInputElement.prototype,
'value').set;
nativeInputSetter.call(input, newValue);
const event = new Event('input', { bubbles: true });
input.dispatchEvent(event);
```
이 방식은 input 엘리먼트에 등록된 React의 onChange Handler를 트리거 하려면 이벤트를 dispatch하기 전에 Object.getOwnPropertyDescriptor를 통해 element 값 속성을 설정하고 이것을 call을 이용해 setter를 직접 재정의해서 속성을 직접 설정하고 dispatchEvent를 적용시켜야 합니다.

값을 직접 value를 통해 설정하면 React의 재정의된 셰터를 사용하기 때문에 작동하지 않아서 이렇게 해야합니다.

이러한 방식을 통해 저는 문제를 해결했습니다.


#### 만약? textarea면 어떡하냐?
```js
const textarea = document.querySelector('textarea');
textarea.value = newValue;
const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
window.HTMLTextAreaElement.prototype,
'value').set;
nativeTextareaSetter.call(textarea, newValue);
const event = new Event('textarea', { bubbles: true });
textarea.dispatchEvent(event);
```
Object.getOwnPropertyDescriptor의 속성을 HTMLTextAreaElement로 해야합니다.

다르면 Type에러가 발생합니다.



### 참고문서
[mozilla](https://developer.mozilla.org/ko/docs/Web/API/EventTarget/dispatchEvent) 문서 <br/>
[javasript.info](https://ko.javascript.info/dispatch-events) 문서

