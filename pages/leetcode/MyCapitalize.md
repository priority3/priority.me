---
author: priority
title: Capitalize
date: 2024-03-25
desc: for typehero
language: EN/CN
---

[[toc]]

## [the problem link](https://typehero.dev/challenge/capitalize)

## case:  
```typescript
type MyCapitalize<S extends string> = any
```

```typescript
type cases = [
  Expect<Equal<MyCapitalize<'foobar'>, 'Foobar'>>,
  Expect<Equal<MyCapitalize<'FOOBAR'>, 'FOOBAR'>>,
  Expect<Equal<MyCapitalize<'foo bar'>, 'Foo bar'>>,
  Expect<Equal<MyCapitalize<''>, ''>>,
  Expect<Equal<MyCapitalize<'a'>, 'A'>>,
  Expect<Equal<MyCapitalize<'b'>, 'B'>>,
  Expect<Equal<MyCapitalize<'c'>, 'C'>>,
  Expect<Equal<MyCapitalize<'d'>, 'D'>>,
  Expect<Equal<MyCapitalize<'e'>, 'E'>>,
  Expect<Equal<MyCapitalize<'f'>, 'F'>>,
  Expect<Equal<MyCapitalize<'g'>, 'G'>>,
  Expect<Equal<MyCapitalize<'h'>, 'H'>>,
  Expect<Equal<MyCapitalize<'i'>, 'I'>>,
  Expect<Equal<MyCapitalize<'j'>, 'J'>>,
  Expect<Equal<MyCapitalize<'k'>, 'K'>>,
  Expect<Equal<MyCapitalize<'l'>, 'L'>>,
  Expect<Equal<MyCapitalize<'m'>, 'M'>>,
  Expect<Equal<MyCapitalize<'n'>, 'N'>>,
  Expect<Equal<MyCapitalize<'o'>, 'O'>>,
  Expect<Equal<MyCapitalize<'p'>, 'P'>>,
  Expect<Equal<MyCapitalize<'q'>, 'Q'>>,
  Expect<Equal<MyCapitalize<'r'>, 'R'>>,
  Expect<Equal<MyCapitalize<'s'>, 'S'>>,
  Expect<Equal<MyCapitalize<'t'>, 'T'>>,
  Expect<Equal<MyCapitalize<'u'>, 'U'>>,
  Expect<Equal<MyCapitalize<'v'>, 'V'>>,
  Expect<Equal<MyCapitalize<'w'>, 'W'>>,
  Expect<Equal<MyCapitalize<'x'>, 'X'>>,
  Expect<Equal<MyCapitalize<'y'>, 'Y'>>,
  Expect<Equal<MyCapitalize<'z'>, 'Z'>>,
]
```

## solution
这题比较简单，如何取到第一个字符以及如何大写都是靠着ide提示直接写出来的。
解决方法简单分为两步：
* 如何取到第一个字符？
这个直接靠猜的有前面[模版字符类型](./Absolute.md)的经验，想当然的取两个infer来拼接，那么第一个infer推断到的值正式第一个字符；
* 如何大写？
靠着ide写了一下`Uppercase`,这是一个内置类型；


```typescript 
type MyCapitalize<S extends string> = S extends `${infer P}${infer T}` ? `${Uppercase<P>}${T}` : S
```

## 总结
关于`Capitalize`的具体实现可以参考[官方](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#uppercasestringtype)
```typescript
function applyStringMapping(symbol: Symbol, str: string) {
    switch (intrinsicTypeKinds.get(symbol.escapedName as string)) {
        case IntrinsicTypeKind.Uppercase: return str.toUpperCase();
        case IntrinsicTypeKind.Lowercase: return str.toLowerCase();
        case IntrinsicTypeKind.Capitalize: return str.charAt(0).toUpperCase() + str.slice(1);
        case IntrinsicTypeKind.Uncapitalize: return str.charAt(0).toLowerCase() + str.slice(1);
    }
    return str;
}
```
均是通过内置函数来实现的；

## 相关联的另一道题目

link: [EndsWith](https://typehero.dev/challenge/endswith)

### case:
```typescript
type EndsWith<T extends string, U extends string> = any
```
```typescript
type cases = [
  Expect<Equal<EndsWith<'abc', 'bc'>, true>>,
  Expect<Equal<EndsWith<'abc', 'abc'>, true>>,
  Expect<Equal<EndsWith<'abc', 'd'>, false>>,
  Expect<Equal<EndsWith<'abc', 'ac'>, false>>,
  Expect<Equal<EndsWith<'abc', ''>, true>>,
  Expect<Equal<EndsWith<'abc', ' '>, false>>,
]
```



### 简述思路
这题的思路是递归的去判断是否以某个字符串结尾，递归的终止条件是`T`与`U`相等，或者`T`为空字符串，这两种情况都是返回`true`，否则就是去递归的去判断`T`去除掉第一个字符后的子串是否以`U`结尾；

```typescript
type EndsWith<T extends string, U extends string> = T extends U ? true : T extends `${infer P}${infer K}` ? EndsWith<K,U> : false
```
