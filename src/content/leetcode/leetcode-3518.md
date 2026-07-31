---
title: leetcode-3518 获取指定位置的最小回文
author: priority
date: 2026-07-30
display: true
tag: leetcode
---
[https://leetcode.com/problems/smallest-palindromic-rearrangement-ii](https://leetcode.com/problems/smallest-palindromic-rearrangement-ii)\
今天是一道hard，题目倒是可以读懂但是做没有啥太好的思路，让ai简单提示了一下，

最终也只到了

> **219 / 812 testcases passed**  太难了

还是讲讲过程，求一个回文 按字典序的第k个位置，能简单想到就是那一半的字符做字典序排序取第k个就好了，比较经典的[逆康托](https://zybuluo.com/jtahstu/note/779430)求位置，但是康托存在的一个前提就是中间不能存在相同的数，否则在求位置权重的时候算出来的值会把相同的字符考虑进去（不过感觉应该有解决办法的 例如就找「相同字符」最右边的一个来看权重就好 maybe 第一次学到这个感觉很经典 但也不太想过度研究了）；

下面的就是写的第一版本，简单来讲就是取一半 做排序，给每一个数尝试求权重然后取字符，对于相同的就选择跳过；

```python
import math
import copy
# 求第k个按字典生序的回文川
# s 是回文
# "gnllllng" k=6 [7, 12, 12, 14] [6, 2, 1, 1] g
class Solution:
    def smallestPalindrome(self, s: str, k: int) -> str:
        if len(s) == 2 or len(s) == 3:
          if k == 1:
            return s
          else:
            return ""
        # 遍历到s.len/2的位置
        # 怎么取第k个呢 逆康托展开
        # 构造数字序列(排序是为了后续存在相同的字符可以直接跳过)
        mid_s = ''
        if len(s) % 2 == 1:
          mid_s = s[len(s)//2]
        nums_s = sorted([ord(s[c]) - ord('a') + 1 for c in range(len(s)// 2)])
        copy_nums_s = copy.deepcopy(nums_s)
        # 逆康托从0开始
        m = k - 1
        fact_s = [math.prod(range(1, c + 1)) for c in range(len(nums_s) - 1, -1, -1)]
        res = []
        res_tail = []
        print(nums_s,fact_s)
        for ind,num in enumerate(nums_s):
            if (ind+1 <len(nums_s) and nums_s[ind+1] == num):
                # 跳过相同的需要在copy_nums_s也移除
                res.append(num)
                copy_nums_s.remove(num)
                break
            print(ind)
            # 计算当前位的数字
            fact = fact_s[ind]
            # 当前位的数字
            cur_num = m // fact
            if (cur_num >= len(copy_nums_s)):
              return ""
            res.append(copy_nums_s[cur_num])
            res_tail = [copy_nums_s[cur_num]] + res_tail
            m = m % fact
            copy_nums_s.remove(copy_nums_s[cur_num])
            # 根据构造的序列反求会char
        if len(copy_nums_s) > 0:
            return ""
        n_res = res + ([ord(mid_s[0]) - ord('a') + 1] if len(s) % 2 == 1 else []) + res_tail
        chat_map = {i: chr(i + ord('a') - 1) for i in range(27)}
        n_res = [chat_map[i] for i in n_res]
        return ''.join(n_res)

```

不过在

> s="gnllllng" k=6    expected："llgnngll"

就失败了，可以看到取第一个数就错误了，取到了g 这是因为权重计算将两个`l` 当成了不同的排列，但实际上取值都是相同的，所以最后算出来的值就不太对了；

最后的解答贴一下吧：

```python
from collections import Counter

# LeetCode 3518 求第 k 个按字典序的回文串 (s 本身保证是回文)
#
# 核心思路: 回文由左半段唯一决定 (右半是镜像, 中间字符固定不参与排列),
#          所以问题 = "给一个字符多重集, 求它的第 k 小排列"
#
# 为什么不能用逆康托展开:
#   逆康托的前提是所有元素互不相同, 这样每一层的每个分支大小都相等 (= 剩余长度的阶乘),
#   才能用一次除法 m // fact 定位。但多重集里分支大小取决于"选了谁之后剩下什么"。
#   以 "gnll" 为例, 按首字符分组:
#       'g' 开头 → 剩 {l,l,n} → 3!/2! = 3 个
#       'l' 开头 → 剩 {g,l,n} → 3!/1! = 6 个
#       'n' 开头 → 剩 {g,l,l} → 3!/2! = 3 个
#   3 、6 、3 互不相等, 固定的阶乘表对不上, 所以改成下面的"逐位试"。
#
# 为什么不能直接用 factorial 算排列数 (朴素版会 TLE):
#   n 可达 1e5, 半串 5e4, factorial(50000) 是个 20 多万位的大整数, 算一次就要几十毫秒,
#   而每一位都得算 → 必然超时。
#   但注意约束 k <= 1e6: 我们只需要知道排列数"是不是 >= k", 不需要精确值。
#   所以改成连乘组合数 + 一超过上限立刻返回, 大数根本不会出现。


class Solution:
    def smallestPalindrome(self, s: str, k: int) -> str:
        n = len(s)
        half = n // 2
        # 奇数长度时正中间那个字符固定不动, 不参与排列
        mid = s[half] if n % 2 else ''

        # 半串为空 (n <= 1) 时只有一种排法, 单独处理免得下面的循环空转
        if half == 0:
            return mid if k == 1 else ""

        # s 本身是回文, 前半段就是半串, 不用再做"次数 // 2"
        cnt = Counter(s[:half])
        # Reason: 把字符种类固定成一个升序列表, 循环里直接遍历它。
        #         这样不用每轮都 sorted(cnt) (会重复排序 half 次),
        #         代价是计数归零的 key 不能删, 得靠 cnt[c] == 0 跳过
        chars = sorted(cnt)

        def comb_capped(n: int, r: int, limit: int) -> int:
            """组合数 C(n, r), 但一旦 >= limit 就立刻返回 limit (不求精确值)

            递推式 res = res * (n-r+i) // i 的每一步部分积恰好是 C(n-r+i, i),
            始终是整数, 所以 // 整除不会丢精度。

            为什么能提前 break: 取了 r = min(r, n-r) 之后必有 n-r >= r >= i,
            于是每步的乘数 (n-r+i)/i >= (i+i)/i = 2 —— 部分积至少翻倍。
            所以最多 log2(1e6) ≈ 20 步就撞上 limit, 循环几乎不可能跑满。
            """
            r = min(r, n - r)
            res = 1
            for i in range(1, r + 1):
                res = res * (n - r + i) // i
                if res >= limit:
                    return limit
            return res

        def perms_capped(remain: int, limit: int) -> int:
            """cnt 里剩余字符的不同排列数, 一旦 >= limit 就返回 limit

            朴素公式是 m! / ∏(cnt_i!), 但那样必须先算出巨大的阶乘。
            换个等价的数法: 依次给每种字符"挑位置"——
                先从 remain 个空位里挑 v_a 个放 a  → C(remain, v_a) 种
                再从剩下的空位里挑 v_b 个放 b      → C(remain-v_a, v_b) 种
                ...
            连乘起来结果一样, 但每个因子都能独立截断, 全程不出现大数。
                "gnll": C(4,1)·C(3,2)·C(1,1) = 4·3·1 = 12 = 4!/2!  ✓
            """
            res = 1
            for c in chars:
                v = cnt[c]
                if v == 0:
                    continue
                res *= comb_capped(remain, v, limit)
                if res >= limit:
                    return limit
                remain -= v
            return res

        res = []
        remain = half           # 还没确定的位置数
        while remain > 0:
            # 剪枝: k == 1 就是要剩余字符的最小排列, 直接按字典序全拼上收工。
            # Reason: 没有这一步, 后面每一位都要白算一遍 perms_capped。
            #         k 一旦降到 1 就再也不会变, 剩下的活是确定的
            if k == 1:
                res.append(''.join(c * cnt[c] for c in chars))
                break

            for c in chars:
                if cnt[c] == 0:         # 这种字符已经用光 (不能删 key, 见上面 chars 的说明)
                    continue
                cnt[c] -= 1             # 试探: 假设这一位放 c
                # 这一位定成 c 之后, 该分支底下有多少个排列。
                # 上限传当前的 k: 只要问"够不够 k 个", 多一个都不用算
                p = perms_capped(remain - 1, k)
                if k > p:
                    # 目标不在这个分支里 → 整个分支跳过
                    # Reason: 减的是分支的【实际大小】p, 不是减 1。
                    #         每个分支大小都不同, 这正是逆康托对不齐的地方
                    k -= p
                    cnt[c] += 1         # 回退, 换下一个字符继续试
                else:
                    res.append(c)       # 目标就在这个分支里, 这一位定为 c
                    remain -= 1
                    break
            else:
                # for...else: 循环【正常跑完一次 break 都没有】才会进 else
                #             (记成 no-break 就顺了, 它属于 for 不属于 if)
                # 所有字符都试遍还是不够 → 总排列数 < k → 无解
                return ""

        left = ''.join(res)
        # left[::-1] 是切片的 [开始:结束:步长], 步长 -1 = 从后往前取 = 整个反转
        # "llgn" → "ngll", 回文的右半就是左半的镜像
        return left + mid + left[::-1]


if __name__ == '__main__':
    import time

    # (s, k, 期望值)
    cases = [
        ("gnllllng", 6, "llgnngll"),   # 半串 "gnll" 共 12 种, 第 6 个是 "llgn"
        ("gnllllng", 12, "nllgglln"),  # 最后一个
        ("gnllllng", 13, ""),          # 越界
        ("xxnfnxx", 3, "xxnfnxx"),     # 半串 "xxn" 共 3 种, 第 3 个即最大
        ("xxnfnxx", 4, ""),
        ("abba", 1, "abba"),
        ("abba", 2, "baab"),
        ("abba", 3, ""),
        ("aaaa", 1, "aaaa"),
        ("aaaa", 2, ""),               # 全同字符只有 1 种排列
        ("a", 1, "a"),                 # 半串为空的边界
        ("a", 2, ""),
        ("aba", 1, "aba"),
        ("aba", 2, ""),
    ]
    for s, k, want in cases:
        got = Solution().smallestPalindrome(s, k)
        flag = 'OK ' if got == want else 'FAIL'
        print(f"{flag}  s={s!r:12} k={k:<3} got={got!r:12} want={want!r}")

    # 暴力对拍: 小规模下跟 itertools 全排列去重的结果比对
    from itertools import permutations
    import random
    random.seed(42)
    bad = 0
    for _ in range(300):
        half_s = ''.join(random.choice('abc') for _ in range(random.randint(1, 6)))
        s = half_s + random.choice(['', 'z']) + half_s[::-1]
        mid = s[len(s) // 2] if len(s) % 2 else ''
        # 所有不同的半串排列, 按字典序
        every = sorted(set(''.join(p) for p in permutations(half_s)))
        for k in range(1, len(every) + 2):
            want = (every[k - 1] + mid + every[k - 1][::-1]) if k <= len(every) else ""
            if Solution().smallestPalindrome(s, k) != want:
                bad += 1
    print(f"\n暴力对拍 300 组随机用例: {'全部通过' if bad == 0 else f'{bad} 处不一致'}")

    # 性能: n = 1e5 的最坏形态 (大量重复字符, 排列数远超 k, 每一位都要真算)
    for half_s, k in [
        ('a' * 30000 + 'b' * 10000 + 'c' * 10000, 1000000),
        (''.join(chr(97 + i % 26) for i in range(50000)), 1000000),
    ]:
        s = half_s + half_s[::-1]
        t = time.perf_counter()
        out = Solution().smallestPalindrome(s, k)
        print(f"n={len(s)}  k={k}  耗时 {time.perf_counter() - t:.3f}s  结果前 20 位: {out[:20]}...")

```
