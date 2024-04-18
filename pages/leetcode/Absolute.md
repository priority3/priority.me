---
author: priority
title: Absolute
date: 2024-03-15
desc: for typehero
language: EN/CN
tag: typehero
---

[[toc]]

## [the problem link](https://typehero.dev/challenge/absolute)

## case:
```typescript
type Absolute<T extends number | string | bigint> = any
```

```typescript
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Absolute<0>, '0'>>,
  Expect<Equal<Absolute<-0>, '0'>>,
  Expect<Equal<Absolute<10>, '10'>>,
  Expect<Equal<Absolute<-5>, '5'>>,
  Expect<Equal<Absolute<'0'>, '0'>>,
  Expect<Equal<Absolute<'-0'>, '0'>>,
  Expect<Equal<Absolute<'10'>, '10'>>,
  Expect<Equal<Absolute<'-5'>, '5'>>,
  Expect<Equal<Absolute<-1_000_000n>, '1000000'>>,
  Expect<Equal<Absolute<9_999n>, '9999'>>,
]
```
## 思路：

前提：
* 数字字面量可以包含下划线 `_`作为分隔符，用来提升代码的可读性。这一特性在 ES2021（或者 TypeScript 2.7+）被引入。当通过模版字符串或其他方式转为字符串时，下划线会被忽略。其中数字后面的`n`表示bigint类型。
```typescript
const a = 1_000_000
`${a}` // 1000000
console.log(a) // 1000000 log转为字符串
```

在ts的类型当中同样存在类似的[模版字符类型](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)

回到本题，希望将一些可以转为数字的类型转为字符串，然后去掉负号。
那么直接判断其是否为负数，如果是的话，去掉负号，否则直接转为字符串。
```typescript
type Absolute<T extends number | string | bigint> = T extends `-${infer P}` ? P : `${T}`
```
但忽略了T是一个负的整数的情况，这时候需要直接将其转为字符串然后再判断
```typescript
type Absolute<T extends number | string | bigint> = `${T}` extends `-${infer P}` ? P : `${T}`
```
