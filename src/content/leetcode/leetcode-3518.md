---
title: leetcode-3518 获取指定位置的最小回文
author: priority
date: 2026-07-30
display: true
tag: leetcode
---
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
