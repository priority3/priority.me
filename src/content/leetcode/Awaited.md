---
author: priority
title: Awaited
date: 2024-03-13
desc: for typehero
language: EN/CN
tag: typehero
---


## [the problem link](https://typehero.dev/challenge/awaited)

just paste some code and brief description here, if wanna see the full content, please click the link above.

If we have a type which is a wrapped type like Promise, how we can get the type which is inside the wrapped type?

For example: if we have Promise `<ExampleType>` how to get ExampleType?

```typescript
type ExampleType = Promise<string>

type Result = MyAwaited<ExampleType> // string
```


## case
```typescript
type MyAwaited<T> = any
```


```typescript
import type { Equal, Expect } from '@type-challenges/utils'

type X = Promise<string>
type Y = Promise<{ field: number }>
type Z = Promise<Promise<string | number>>
type Z1 = Promise<Promise<Promise<string | boolean>>>
type T = { then: (onfulfilled: (arg: number) => any) => any }

type cases = [
  Expect<Equal<MyAwaited<X>, string>>,
  Expect<Equal<MyAwaited<Y>, { field: number }>>,
  Expect<Equal<MyAwaited<Z>, string | number>>,
  Expect<Equal<MyAwaited<Z1>, string | boolean>>,
  Expect<Equal<MyAwaited<T>, number>>,
]

// @ts-expect-error
type error = MyAwaited<number>
```


## 分析🙉：
从case当中可以一眼得出会是一个递归的情况；

首先最基本的情况，能用infer推到出`Promise`中的类型；
```typescript
type MyAwaited<T> = T extends Promise<infer U> ? U : T
```
那么接下来处理嵌套的问题，很自然的写出这样的代码，
```typescript
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T 
```
但是存在的一个问题就是最后一个case它并不是一个标准的`Promise`,但ts库提供了一个[PromiseLike](https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_es5_d_.promiselike.html)：
> 是以Interface 定义的接口类型。它需要实现thenable 特征。
简而言之只要含有`then`方法的对象都可以被认为是一个`PromiseLike`类型；与Promise相差无几。但相比之下少了个catch 和finally 的定义，比Promise定义宽松得多。如AXIOS自己封装了一个针对异步请求的[AxiosPromise](https://link.zhihu.com/?target=https%3A//github.com/axios/axios/blob/7fbfbbeff69904cd64e8ac62da8969a1e633ee23/index.d.cts)类型。

所以将答案修改为：
```typescript
type MyAwaited<T> = T extends PromiseLike<infer U> ? MyAwaited<U> : T 
```

但是还需要主要到最后一个case
```typescript
// @ts-expect-error
type error = MyAwaited<number>
```
上面的类型最终的返回结果会是一个number，然后想到对初始的泛型T做一个限制
```typescript
type MyAwaited<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? MyAwaited<U> : T 
```
但是上面的类型会报错`Type 'U' does not satisfy the constraint 'PromiseLike<any>'.` 即推断的U类型不一定满足`PromiseLike<any>`的约束；

```typescript
type MyAwaited<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? (U extends PromiseLike<any> ? MyAwaited<U> : U) : T 
```
考虑再嵌套一层在中间加一层判断符合 `PromiseLike<any>`的约束走递归，否则直接就是拿到了原始类型返回；


当然也会有ts本身支持类型的一种写法：
```typescript
type MyAwaited<T extends PromiseLike<any>> = Awaited<T>
```

## 综上
学习了`PromiseLike`\\`Awaited`
