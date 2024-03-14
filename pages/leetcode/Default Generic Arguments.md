---
author: priority
title: Default Generic Arguments
date: 2024-03-12
desc: for typehero
language: EN/CN
---

[[toc]]

## [the problem link](https://typehero.dev/challenge/default-generic-arguments)

just paste some code and brief description here, if wanna see the full content, please click the link above.


A lot of the same rules apply in types that apply to function argument defaults. For example, you can't have a required argument following a default argument.


## case:

```typescript
type ApiRequest = unknown
type TSConfig = unknown
```

```typescript
import { Expect, Equal } from 'type-testing';

type test_ApiRequest_explicitPost = Expect<
  Equal<ApiRequest<string, 'POST'>, { data: string; method: 'POST' }>
>;

type test_ApiRequest_implicitGet = Expect<
  Equal<ApiRequest<number>, { data: number; method: 'GET' }>
>;

type test_TSConfig_default = Expect<Equal<TSConfig, { strict: true }>>;

type test_TSConfig_true = Expect<Equal<TSConfig<{ strict: true }>, { strict: true }>>;

type test_TSConfig_false = Expect<Equal<TSConfig<{ strict: false }>, { strict: false }>>;

type test_TSConfig_boolean = Expect<Equal<TSConfig<{ strict: boolean }>, { strict: boolean }>>;
```

## 分析：

* 对于`ApiRequest`这个类型从给出的case当中可以看出，接收两个泛型参数，对应的对象
```typescript
{
  data:泛型;
  method:泛型;
}
```
但同时要满足`Equal<ApiRequest<number>, { data: number; method: 'GET' }>`说明第二个泛型接受一个默认参数`'GET'`

所以最终答案为：
```typescript
type ApiRequest<T,U = 'GET'> = {
  data: T;
  method:U;
} 
```

* 对于`TSConfig` 看得出它接收什么返回什么即可;
```typescript
type TSConfig<T = { strict: true }> = T
```


*虽然综上的类型可以通过case并且提交成功，但是在实际的场景下我们还需要加上类型限制；*
例如对于`ApiRequest<T,U='GET'>`,U给了默认的'GET'，例如我们需要限制U的类型只能是'GET'或者'POST'，这样才能保证类型的安全性；

```typescript
type ApiRequest<T,U extends 'GET'|'POST' = 'GET'> = {
  data: T;
  method:U;
} 
```

这样即使 类似于
```typescript
const a:ApiRequest<number,'a'> = {
  data:1,
  method:'a'
} // 这样的类型也是不允许的
```

对于`TSConfig`同理
```typescript
type TSConfig<T extends {strict:boolean} = { strict: true }> = T
```
