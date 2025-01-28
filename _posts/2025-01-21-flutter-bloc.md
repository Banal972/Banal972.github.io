---
title: BLoC패턴을 이용한 간단한 stream구축
date: 2025-01-21
categories: [Discover, Flutter]
tags: [Discover,Flutter,Design-pattren]
---

### BLoC Pattern이란?

BLoC Pattern은 Flutter에서 자주 사용되는 패턴 중에 하나 입니다.
비즈니스 로직을 UI랑 분리하고 코드의 재사용성과 유지보수성을 높이는 데 유용한 패턴중에 하나 입니다.

![Image Alt 텍스트](/assets/img/figure2_ bloc.png)

[이미지 출저](https://www.ics.com/blog/building-flutter-discover-bloc-pattern)

BLoC Pattern을 이미지로 보여주기에 가장 적절해서 가져와봤습니다.

<br/>

### BLoC Pattern 구성법

BLoC Pattern은 간단하게 
- Event
    - 사용자가 UI에서 발생시키는 액션 위주
- State
    - BLoC에서 처리되거나 관리되는 상태
    - UI에서 이 부분을 구독하여 화면을 렌더링 합니다.
- BLoC
    - stream를 활용해서 데이터를 관리합니다.

로 구성 되어있다고 보면 될것 같습니다.

<br/>

### BLoC 예제 코드

저는 rxdart 라이브러리를 통해 BLoC Pattern 과 Singleton 패턴을 조합해서 만들어 봤습니다.

```dart
Class Bloc {
    static final Bloc _instance = Bloc._internal();
    late BehaviorSubject<int> subject;

    Stream<int> get stream => _instance.subject.stream; // 데이터 관리를 위한 stream

    factory CenterBloc() => _instance;
    CenterBloc._internal() {
        subject = BehaviorSubject<int>(); // 초기화값
    }

    int get items => _instance.subject.valueOrNull ?? 0;

    void change(int number) {
        _instance.subject.sink.add(number);
    }
}
```

간략하게 subject를 설명하면 
`late BehaviorSubject<int> subject;`
- 상태 값을 저장하는 BehaviorSubject를 선언

`Stream<int> get stream => _instance.subject.stream;`
- stream은 외부에서 데이터 변경 사항을 구독할 수 있도록 스트림을 제공

`int get items => _instance.subject.valueOrNull ?? 0;`
- items는 현재 저장된 상태 값을 반환하고 값이 없을 경우 기본값 0을 반환

```dart
    void change(int number) {
        _instance.subject.sink.add(number);
    }
```
change 메서드는 새로운 데이터를 subject에 추가 후 스트림을 통해 방출

이렇게 볼 수 있고

싱글턴 패턴은
factory Bloc() => _instance;
`factory 키워드를 사용한 팩토리 생성자는 새로운 객체를 생성하지 않고 기존의 _instance를 반환합니다.`

```dart
    Bloc._internal() {
        subject = BehaviorSubject<int>(); // 초기화
    }
```
_internal은 생성자로 외부에서 직접 호출할 수 없지만 이는 클래스 내부에서만 사용되며 싱글턴 인스턴스를 초기화하는 역할을 하게 됩니다.

<br/>

### 실제 사용 예
```dart
final Bloc bloc = Bloc();
bloc.stream.listen((value) {
    print("새로운 값: $value");
});
bloc.change(5); // 출력: 새로운 값: 5
```

<br/>

저는 이렇게해서 간단한 BLoC 패턴을 구현했습니다.
<br/>
BLoC 패턴은 꼭 정해진 답은 없고 여러가지 라이브러리로도 구현이 가능하기에 여러가지 를 찾아보고
본인에 맞는 방식을 구현하는것이 가장 베스트 라고 생각합니다.