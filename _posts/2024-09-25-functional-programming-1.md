---
title: 함수형 프로그래밍 - (1)
date: 2024-09-25
categories: [Discover, functional-programming]
tags: [Discover]
---

<!-- #### 이 문서를 읽기전에
[함수형 프로그래밍 입문기](/post/functional-programming-0912)를 읽어보는것을 추천드립니다. -->


### 어떤것이 함수형 프로그래밍일까?

#### 순수 함수

함수형 프로그래밍의 특징으로는 순수 함수라는 특징이 있습니다.
입문기에서도 적었다 싶이 순수 함수는 SideEffect가 없는것을 순수함수이며
SideEffect는 외부 상태값을 참조하거나 변경하지 않는것 않는것을 얘기합니다.

예를 들어
```js
let num = 1;
function add(a){
    return a + num;
}
```
이것은 순수함수가 아닙니다.

```js
function add(a,b){
    return a+b;
}
```
이것은 순수함수 입니다.
순수함수는 호출할때마다 항상 같은 값을 가져옵니다.

<br/>

객체도 마찬가지 입니다.
```js
let student = { name : "kim", grade : 1};

function incStudent(student){
    student.grade = 2;
    return student;
}
```
이것은 순수 함수가 아닙니다. 
객체를 가져와서 객체의 값을 변경하기 때문입니다.

```js
let student = { name : "kim", grade : 1};

function incStudent(student){
    return {...student, grade : student.grade++};
}
```
이것은 순수함수입니다. 
객체를 변경하지 않고 새로운 객체를 반환해주기 때문에 외부의 상태를 변경하지 않기 때문입니다.

이렇게 되면 부수효과 즉 sideEffect를 만들지 않아 불변성을 유지하고, 멑티쓰레딩 환경에서도 안정적이게 만들수 있습니다.

<br/>

#### for, switch, if 같은것을 사용하지말자
```js
const numbers = [1,2,3,4,5]

function iterate(numbers) {
    let sum = 0;
    for (let i = 0; i < numbers.length; i++){
        sum += arr[i];
    }
    return sum;
}
```
이렇게 for, switch, if를 쓰는것은 함수형 프로그래밍이라고 볼 수 없습니다.


```js
const numbers = [1,2,3,4,5]

function iterate(numbers) {
    return numbers.reduce((acc,cur)=>acc+cur,0);
}
```
위의 for문을 reduce나 map, filter등 여러가지 메서드들을 활용해서 작성하는것을 함수형 프로그래밍 이라고 합니다.

<br/>

#### 일급함수 특징을 활용하자
함수를 변수에 할당해서 사용하는 방법도 있습니다.
```js
const double = (x) => x * 2;
const addOne = (x) => x + 1;
const doubleThenAddOne = (x) => addOne(double(x));
console.log(doubleThenAddOne(5)); 
```

함수에서 또 다른 함수를 리턴하는 고차함수 방법도 있습니다.
```js
const greaterThan = n => x => x > n;

const greaterThan10 = greaterThan(10);
console.log(greaterThan10(15)); // true
console.log(greaterThan10(5));  // false
```

<br/>

#### 마지막으로
함수형 프로그래밍의 기본기는 알았는데 아직까지 깊게 사용하는법을 잘 몰라
여러가지의 공부가 필요할것 같습니다. 앞으로 함수형 프로그래밍에 더 집중해서 공부하고 정리해보도록 하겠습니다.