---
author: priority
title: 双周赛134
date: 2024-07-06
desc: leetcode
language: CN
tag: leetcode
---

[[toc]]

## 前言
[biweekly-contest-134](https://leetcode.cn/contest/biweekly-contest-134)

ac 3题

### [ 第一题：100336. 交替组 I ](https://leetcode.cn/problems/alternating-groups-i/)

给你一个整数数组 colors ，它表示一个由红色和蓝色瓷砖组成的环，第 i 块瓷砖的颜色为 colors[i] ：

colors[i] == 0 表示第 i 块瓷砖的颜色是 红色 。
colors[i] == 1 表示第 i 块瓷砖的颜色是 蓝色 。
环中连续 3 块瓷砖的颜色如果是 交替 颜色（也就是说中间瓷砖的颜色与它 左边 和 右边 的颜色都不同），那么它被称为一个 交替 组。

请你返回 交替 组的数目。

注意 ，由于 colors 表示一个 环 ，第一块 瓷砖和 最后一块 瓷砖是相邻的。

> 输入：colors = [1,1,1]
输出：0

> 输入：colors = [0,1,0,0,1]
输出：3

#### 思路
按照题意，暴力遍历就可以,特殊处理一下第一项和最后一项
```typescript
function numberOfAlternatingGroups(colors: number[]): number {
  let res = 0
  for (let i = 0; i < colors.length; i++) {
    if (i === 0) {
      if (colors[i] !== colors[i + 1] && colors[i] !== colors[colors.length - 1])
        res++

      continue
    }
    if (i === colors.length - 1) {
      if (colors[i] !== colors[i - 1] && colors[i] !== colors[0])
        res++

      continue
    }
    if (colors[i] !== colors[i + 1] && colors[i] !== colors[i - 1])
      res++
  }
  return res
}

```

### [第二题： 100182. 与敌人战斗后的最大分数](https://leetcode.cn/problems/maximum-points-after-enemy-battles/)

给你一个下标从 0 开始的整数数组 enemyEnergies ，它表示一个下标从 0 开始的敌人能量数组。

同时给你一个整数 currentEnergy ，它表示你一开始拥有的能量值总量。

你一开始的分数为 0 ，且一开始所有的敌人都未标记。

你可以通过以下操作 之一 任意次（也可以 0 次）来得分：

* 选择一个 未标记 且满足 currentEnergy >= enemyEnergies[i] 的敌人 i 。在这个操作中：
> 你会获得 1 分。
你的能量值减少 enemyEnergies[i] ，也就是说 currentEnergy = currentEnergy - enemyEnergies[i] 。
* 如果你目前 至少 有 1 分，你可以选择一个 未标记 的敌人 i 。在这个操作中：
> 你的能量值增加 enemyEnergies[i] ，也就是说 currentEnergy = currentEnergy + enemyEnergies[i] 。
敌人 i 被标记 。
请你返回通过以上操作，最多 可以获得多少分。

#### 思路
开始想的饶了一下，仔细琢磨一下题意其实可以发现，为获得最大分数，只需要一直和 `enemyEnergies` 中最小的数就行操作一即可，同时标记其他的数

```typescript
function maximumPoints(enemyEnergies: number[], currentEnergy: number): number {
  enemyEnergies.sort((a, b) => a - b)
  // 至少一分
  if (currentEnergy < enemyEnergies[0])
    return 0
  const maxEnergy = currentEnergy + enemyEnergies.reduce((pre, cur) => {
    return pre + cur
  }) - enemyEnergies[0]

  return Math.floor(maxEnergy / enemyEnergies[0])
}

```

**tip**:
 `~~` 和 `Math.floor()` 的区别

在这道题中最后一步用上述两种不同的方法居然在某些特例下会有不同的结果，如果使用`~~`在某个特例下不能通过


> enemyEnergies = 
[100000,99999,99998,99997,99996,99995,99994,99993,99992,99991,99990,99989,99988,99987,
99986,99985,99984,99983,99982,99981,99980,99979,99978,99977,99976,99975,99974,99973,99972,
99971,99970,99969,99968,99967,99966,99965,99964,99963,99962,99961,99960,99959,99958,99957,
99956,99955,99954,99953,99952,99951,99950,99949,99948,99947,99946,99945,99944,99943,99942,
99941,99940,99939,99938,99937,99936,99935,99934,99933,99932,99931,99930,99929,99928,99927,
99926,99925,99924,99923,99922,99921,99920,99919,99918,99917,99916,99915,99914,99913,99912,
99911,99910,99909,99908,99907,99906,99905,99904,99903,99902,99901,99900,99899,99898,99897,
99896,99895,99894,99893,99892,99891,99890,99889,99888,99887,99886,99885,99884,99883,99882,
99881,99880,99879,99878,99877,99876,99875,99874,99873,99872,99871,99870,99869,99868,99867,
99866,99865,99864,99863,99862,99861,99860,99859,99858,99857,99856,99855,99854,99853,99852,
99851,99850,99849,99848,99847,99846,99845,99844,99843,99842,99841,99840,99839,99838,99837,
99836,99835,99...
> 
> currentEnergy = 1

输出： 705082704

预期： 5000050000

而如果使用`Math.floor()`则可以通过

其两者差异在于 
`~~` 是通过对数字执行两次按位取反操作来实现取整。这种方法只能用于32位有符号整数，所以它适用于对较小范围的数值进行取整。

`Math.floor` 方法返回小于或等于一个给定数字的最大整数。它可以处理任何大小的数值，包含正数和负数。


```typescript
let num = 123456.789;

// 使用双取反
console.log(~~num); // 输出: 123456

// 使用 Math.floor
console.log(Math.floor(num)); // 输出: 123456

// 处理较大数值时的区别
let largeNum = 123456789123.456;

// 使用双取反（结果可能不准确）
console.log(~~largeNum); // 输出: 1912276179（不准确）

// 使用 Math.floor（结果准确）
console.log(Math.floor(largeNum)); // 输出: 123456789123

```
总结起来，如果你只需要处理较小范围的数值且需要较高性能，~~ 是一个简洁的选择；否则，Math.floor 更加通用且安全。


### 第三题：100351. 交替组 II

给你一个整数数组 colors 和一个整数 k ，colors表示一个由红色和蓝色瓷砖组成的环，第 i 块瓷砖的颜色为 colors[i] ：

colors[i] == 0 表示第 i 块瓷砖的颜色是 红色 。
colors[i] == 1 表示第 i 块瓷砖的颜色是 蓝色 。
环中连续 k 块瓷砖的颜色如果是 交替 颜色（也就是说除了第一块和最后一块瓷砖以外，中间瓷砖的颜色与它 左边 和 右边 的颜色都不同），那么它被称为一个 交替 组。

请你返回 交替 组的数目。

注意 ，由于 colors 表示一个 环 ，第一块 瓷砖和 最后一块 瓷砖是相邻的。

> 输入：colors = [0,1,0,1,0], k = 3
输出：3

> 输入：colors = [0,1,0,0,1,0,1], k = 6
输出：2


#### 思路
如果采取和第一题一样的思路去暴力解，易得到一个O（n*n）的复杂度算法：
```typescript
function numberOfAlternatingGroups(colors: number[], k: number): number {
  let res = 0
  colors.forEach((color, index) => {
    let flag = true
    let preColor = color
    for (let i = index + 1; i < index + k; i++) {
      const nextColor = colors[i % colors.length]
      if (nextColor === preColor) {
        flag = false
        break
      }
      preColor = nextColor
    }
    if (flag)
      res++
  })
  return res
}
```

显然超时，考虑优化的思路能否降到O（n），如果是需要降到O（n）那么我们则可以去保证colors中的数都只遍历一次，即我们需要一个数来暂存一下上一次记录正确的位置，下次遍历直接从正确的位置开始遍历即可；同时为了避免循环内部的特殊处理，考虑将colors扩展一倍，这样就不需要考虑环的问题；


```typescript
function numberOfAlternatingGroups(colors: number[], k: number): number {
  let res = 0
  let lasCorrectInd = 0
  const newColor = colors.concat(colors)
  for (let i = 0; i < colors.length; i++) {
    let flag = true
    const preInd = Math.max(lasCorrectInd, i)
    let preColor = colors[preInd]
    for (let j = preInd + 1; j < i + k; j++) {
      const nextColor = newColor[j]
      if (nextColor === preColor) {
        flag = false
        lasCorrectInd = j - 2
        break
      }
      preColor = nextColor

      if (j === i + k - 1)
        lasCorrectInd = j - 1
    }
    if (flag)
      res++
  }
  return res
}
```
这里需要有一个边缘case的问题，需要保证`lasCorrectInd`是比实际位置往前一格
考虑如下
> 0 1 0 1 0 0 1 0 1
到ind = 4 都是正确的，那么下一次遍历就会直接从ind = 5 开始，这样会误判成都是交替；所以实际上要保证`lasCorrectInd`是比实际位置往前一格

### 第四题 略

### 总结
常规ac3道题，但是第三道题想的太多了，代码逻辑写的过于复杂以及存在一些特殊的边缘case，最后比赛时间过了才写出来。
