---
title: leetcode-3513 三数异或
author: priority
date: 2026-07-24
language: CN
display: true
tag: leetcode
---
[https://leetcode.com/problems/number-of-unique-xor-triplets-i](https://leetcode.com/problems/number-of-unique-xor-triplets-i)\
\
很久没有做算法题了，今天偶尔想起来一道每日一题；\
但是看上去做的心情有点不太好，感觉越来越菜了；

这道题其实最简单暴力的一眼能看出来的解法就是三重循环依次异或一下将结果统一都放到一个set集合中去，最后返回set长度；不过看了一下给定的n和nums[i]显然都是很容易就tle的，所以简单还问了下ai优化到了O(n^2)但是还是会发现超时；最后看了下题解，是一道需要做证明的数学题；

先贴一下容易想到的但是却会tle的解法：

```python
class Solution:
    def uniqueXorTriplets(self, nums: List[int]) -> int:
        # 一定会包含这个数组本身的指 
        # 可以任意取两个相同位置的数 异或结果为0 所以最终异或的结果一定是最后的数 即数组中任意的指
        nums_result = set(nums)
        pair_xor = set()
        seen = []
        n = len(nums)
        for k in range(n):
            for p in pair_xor:
                nums_result.add(p ^ nums[k])            
            for x in seen:
                pair_xor.add(x ^ nums[k])
            seen.append(nums[k])
        return len(nums_result)
        # for i in range(len(nums)):
        #     for j in range(i+1,len(nums)):
        #         for k in range(j+1,len(nums)):
        #             xor_res = nums[i] ^ nums[j] ^ nums[k]
        #             nums_result.add(xor_res)
        return len(nums_result)       

```

最后给一下题解：

```python
from typing import List

class Solution:
    def uniqueXorTriplets(self, nums: List[int]) -> int:
        n = len(nums)

        # n = 1 或 2 时，答案分别是 1 和 2
        if n <= 2:
            return n

        # 2 ** n.bit_length() 是严格大于 n 的最小 2 的幂
        return 1 << n.bit_length()
```

做一下证明：

注意题目范围

> - `1 <= n == nums.length <= 105`

- `1 <= nums[i] <= n`
- `nums` is a permutation of integers from `1` to `n`.

由于 i <= j <= k (i,j,k 为三个数的下标)

那么当 i = j 时，三个数的异或结果 **nums[i] ^ nums[j] ^ nums[k]** 的结果就为 nums[k] ，又 k 可以取任意值，那么nums[k]即最后的结果 也就可以取到任意值；这也就是我一开始就将结果设置为一个n的集合原因（不过发现这里忽略了一个case）；

这里得出的实际结论是 1 - n 的结果都可以获取；忽略的case就是0，因为1 < nums[i] < n ;\
不过这可以很容易构造出来case ：

> 1 ^ 2 ^ 3 = 0

所以当n >= 3 时 ，起码可以得到 n 个不同的异或结果；

那么接下来考虑后续的三个数的异或会不会产生大于n的结果

从异或的特性可以看出一些问题：\
两个数进行异或时 不会产生新的更高位

例如

> 5 （101）^ 2 （010）= 7 （111）

不妨将 nums[i] ^ nums[j] 的结果记为 a，那么a的位数一定小于等于nums[k]的位数；（由于异或的顺序不影响最终的结果，i,j,k都是任取的，暂时后续都记为nums[i]<nums[j]<nums[k]，不影响题意）

那么 a ^ nums[k] 其结果也一定不会产生大于nums[k]的最大位数； 而nums[k]最大才为n，所以最终的结果一定小于 2^^n.bitlength

前面已经证明了可以去到[0,n]

接下来我们证明可以获取到 [n, (2^^n.bitlength) - 1]

我们记n的位数为p，

保持前面的定义 a = nums[i]^nums[j]，最后的结果记为res

那么可以得出：

> 2 ^^ (p-1 ) < n < res < 2 ^^ p

所以可以看出来 res 的最高位一定是 2 ^^ (p-1)

我们这里就是要拆成三个值可以异或出我们要的结果，观察题意整个nums[i]是一个n的不重复集合，我们需要证明的范围是：[n, (2^^n.bitlength) - 1]，所以整个集合中一定出现2 ^^ (p-1 ) ，

那么我们不妨令 y = 2 ^^(p-1) ^ res

这里的y的定义实际上就是取 除去最高位后的值；

那么接下来我们只需要找出两个合法的b、c值构造出来即可；

> res = y ^ b ^ c

记 q = b^c 那么 q < y 的，因为y是最高位；

> q = res ^ y
> 
> 1 < q < 2 ^^ (p-1) < n < res < 2 ^^ p

从 q = 1 ^ q ^ 1 出发

记b = 1，c = q ^ 1;

那么q ^ 1的本质无非就是 +- 1；

```
偶数 XOR 1 = 这个数 + 1
奇数 XOR 1 = 这个数 - 1 
```

考虑特殊的case q = 0或者q=1

q = 0 时 b = c = 1 符合

q = 1 时 b = 1 ，c = 0, 显然不符合c的定义范围，

所以我们重新选择，构造一个q = 1即可；b = 2 , c =3

综上我们可以找到两个合法的b 、c 构造出 res = y ^ b ^ c

---

但是我觉得需要严格说明一下证明的意义  q 的取值范围为[1,2 ^^ (p-1)]

上面我们实际上要做的是

```
对于每一个 q ∈ [0,y-1]
都存在 b,c ∈ [1,n]
使得 b XOR c = y
```

只是我们这里的做的特殊取值 发现 b取 1 ，c取 q ^ 1

对于y=0，y=1 特殊case参照前面的例子，所以我们只需要看b，c是不是在合理的取值范围即可

1 < b =  q ^ 1 <= y-1 < n

显示满足，最终发现总是可以找到一个 b，c 作用域在[1,n] 是的 q = b ^ c 其值域在[0,y-1]

最终证毕 结果为 2 ^^ n.bitlength
