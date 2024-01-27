---
author: priority
title: vue diff 
date: 2022-10-21
desc: Obtaining the longest increasing subsequence with the diff algorithm of vue
language: EN
---

[[toc]]

## Vue renderder

as we know, vue use the diff algorithm to update the dom tree with vnode(which used when ends are `Array`), so we should use some efficient methods to `Patch`, the diff algorithm came into being.


### Double ended diff in vue2
(tips: sorry, I don't know if it's called, but just call it that now), 
firstly, we will know the basic diff algorithm.

#### basic diff

```js
const oldChildren = n1
const newChildren = n2
// we use `lastIndex` to record the most biggest `index` of the oldChildren
let lastIndex = 0
for (let i = 0; i < newChildren.length; i++) {
  const newVNode = newChildren[i]
  for (let j = 0; j < oldChildren.length; j++) {
    if (oldChildren[j].key === newVNode.key) {
      const oldVNode = oldChildren[j]
      // patch
      patch(oldVNode, newVNode, container)
      if (j < lastIndex) {
        // move
        const prevVNode = newChildren[i - 1]
        if (prevVNode) {
          const anchor = prevVNode.el.nextSibling
          insert(newVNode.el, container, anchor)
        }
      }
      else {
        lastIndex = j
      }
      break
    }
  }
}
```
##### some cases

* newChildren.length greater than oldChildren.length

* newChildren.length less than oldChildren.length 

```js
let find = false
for (let i = 0; i < newChildren.length; i++) {
  // ...
  for (let j = 0; j < oldChildren.length; j++) {
    if (oldChildren[j].key === newVNode.key) {
      // add this
      find = true
      // ...
      if (j < lastIndex) {
        // ...
      }
      else {
        // ...
      }
      break
    }
    // add following code maybe work well to delete el in children which not in the `newChildren`
    // else {
    //   unmount(oldChildren[j])
    // }
  }
}

// there means that the newVNode is not in the oldChildren, so we should add it
if (!find) {
  const prevVNode = newChildren[i - 1]
  let anchor = null
  if (prevVNode)
    anchor = prevVNode.el.nextSibling

  else
    anchor = container.firstChild

  insert(null, newVNode, container, anchor)
}

// there means that the oldVNode is not in the newChildren, so we should remove it
for (let i = 0; i < oldChildren.length; i++) {
  const oldVNode = oldChildren[i]
  const find = newChildren.find(el => el.key === oldVNode.key)
  if (!find)
    unmount(oldVNode.el)
}
```


in the basic , the `time complexity` is O(n^2), so we should use some efficient methods to improve it.

#### Double ended diff

this is the patch diff algorithm of vue 

how it is working ?
we add four `Pointer` , which pointing separately the start and end endpoints of the oldChildren and newChildren, and we will compare the `key` of the `oldChildren` and `newChildren` to find the `same` and `different` elements, and then we will use the `same` elements to update the dom tree, and we will use the `different` elements to add or remove the dom tree. What is more, we will move the `same` elements to the right position by the key.

##### 1. find same key

![image.png](https://s2.loli.net/2022/10/24/pgZWuOok5ywE8eC.png)

we make judgments in the order in the picture, and move in sequence after.

```js
const oldStartIdx = oldChildren[0]
const oldEndIdx = oldChildren[oldChildren.length - 1]
const newStartIdx = newChildren[0]
const newEndIdx = newChildren[newChildren.length - 1]

const oldStartVNode = oldChildren[oldStartIdx]
const oldEndVNode = oldChildren[oldEndIdx]
const newStartVNode = newChildren[newStartIdx]
const newEndVNode = newChildren[newEndIdx]

// eslint-disable-next-line no-unmodified-loop-condition
while (oldStartIdx < oldEndIdx && newStartIdx < newEndIdx) {
  // eslint-disable-next-line no-empty
  if (oldStartVNode.key === newStartVNode.key) {

  }
  // eslint-disable-next-line no-empty
  else if (oldEndVNode.key === newEndVNode.key) {

  }
  // eslint-disable-next-line no-empty
  else if (oldStartVNode.key === newEndVNode.key) {

  }
  // eslint-disable-next-line no-empty
  else if (oldEndVNode.key === newStartVNode) {

  }
}
```


we will finished these cases that move the `same` elements to the right position by the key.

##### **move it**

```js
while (oldStartIdx < oldEndIdx && newStartIdx < newEndIdx) {
  if (oldStartVNode.key === newStartVNode.key) {
    patch(oldStartVNode, newStartVNode, container)
    // next
    oldStartVNode = oldChildren[++oldStartIdx]
    newStartVNode = newChildren[++newStartIdx]
  }
  else if (oldEndVNode.key === newEndVNode.key) {
    patch(oldEndVNode, newEndVNode, container)
    // next
    oldEndVNode = oldChildren[--oldEndIdx]
    newEndVNode = newChildren[--newEndIdx]
  }

  else if (oldStartVNode.key === newEndVNode.key) {
    patch(oldStartVNode, newEndVNode, container)
    // move `oldStartVNode` to after `oldEndVNode`
    insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling)
    oldStartVNode = oldChildren[++oldStartIdx]
    newEndVNode = newChildren[--newEndIdx]
  }

  else if (oldEndVNode.key === newStartVNode.key) {
    patch(oldEndVNode.el, container, newStartVNode.el)
    // move `oldEndVNode` to before the `oldStartVNode`
    insert(oldEndVNode.el, container, oldStartVNode.el)
    oldEndVNode = oldChildren[--oldEndIdx]
    newStartVNode = newChildren[++newStartIdx]
  }
}
```

in there, we finish basic cases, we will consider other special situations.


##### **special situations**

* no same key when the loop

* newChildren.length greater than oldChildren.length

* newChildren.length less than oldChildren.length 


```js
// no same key when the loop
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
  if (!oldStartVNode) {
    oldStartVNode = oldChildren[++oldStartIdx]
  }
  else if (!oldEndVNode) {
    oldEndVNode = oldChildren[--oldEndIdx]
  }
  else if (oldStartVNode.key === newStartVNode.key) {
    // ...
  }
  else if (oldEndVNode.key === newEndVNode.key) {
    // ...
  }
  else if (oldStartVNode.key === newEndVNode.key) {
    // ...
  }
  else if (oldEndVNode.key === newStartVNode.key) {
    // ...
  }
  else {
    // find the same key in the newStartVNode of newChildren
    const idxInOld = oldChildren.findIndex(
      node => node.key === newStartVNode.key
    )
    if (idxInOld > 0) {
      const vnodeToMove = oldChildren[idxInOld]
      patch(vnodeToMove, newStartVNode, container)
      insert(vnodeToMove.el, container, oldStartVNode.el)

      oldChildren[idxInOld] = undefined
    }
    else {
      // add newStartVNode to before the oldStartVNode
      patch(null, newStartVNode, container, oldStartVNode.el)
    }
    newStartVNode = newChildren[++newStartIdx]
  }
}
// delete the oldChildren which is not used
if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
  for (let i = oldStartIdx; i <= oldEndIdx; i++)
    unmount(oldChildren[i])
}

```

so far, the double ended diff algorithm is finished. the `time complexity` is O(n^2) in the worst case


### fast diff in vue3

double ended diff is not the best performance for vue, Introduced `fast diff` in the vue3.

#### how is it working ?
it is like the `String` comparison.
```js
const oldNode = 'this is a good day'
const newNode = 'this is a bad day'
```

how we patch it that between `oldNode` and `newNode` ?

generally speaking, we just make `oldNode = newNode` to update it, but it is not the best performance. We will have comparision between start and end, we just find not equal element, As above, we just replace the 'good' to 'bad' to update it. the `fast diff` like this.

firstly, we will compare the start and end endpoints of oldNode and newNode until they are not equal.

![image.png](https://s2.loli.net/2022/10/25/WGs7JyqbwBYnMmZ.png)


```js
const oldChildren = n1.children
const newChildren = n2.children
let j = 0
let oldVNode = oldChildren[j]
let newVNode = newChildren[j]
while (oldNode.key === newNode.key) {
  patch(oldVNode, newVNode, container)
  j++
  oldVNode = oldChildren[j]
  newVNode = newChildren[j]
}

let newEnd = newChildren.length - 1
let oldEnd = oldChildren.length - 1
oldVNode = oldChildren[oldEnd]
newVNode = newChildren[newEnd]
while (oldVNode.key === newVNode.key) {
  patch(oldVNode, newVNode, container)
  oldVNode = oldChildren[--oldEnd]
  newVNode = newChildren[--newEnd]
}
```

in here, we will find some cases that:
1. newChildren.length greater than oldChildren.length

![image.png](https://s2.loli.net/2022/10/25/QwKug7M8H9StzFr.png)

2. newChildren.length less than oldChildren.length

![image.png](https://s2.loli.net/2022/10/25/PSF6it1ZuzrpUCa.png)

```js
// while(){
//   //...
// }

// while(){
//   //...
// }

if (j > oldEnd && j <= newEnd) {
  const anchorIndex = newEnd + 1
  const anchor = anchorIndex < newChildren.length
    ? newChildren[anchorIndex].el
    : null

  while (j < newEnd)
    patch(null, newChildren[j++], container, anchor)

}
else if (j > newEnd && j <= oldEnd) {
// j -> oldEnd 之间的节点应该被卸载
  while (j <= oldEnd)
    unmount(oldChildren[j++])

}
```


complex case:

![image.png](https://s2.loli.net/2022/10/25/YjVIeGtcJXD1d76.png)


after above all, we will maintain the `Array` named `source` which contained `index` where `newVNode.key` appear in `oldChildren`,
based on above, the `source` is `[2,3,1,-1]`,
the default value is `-1` if the `key` had not appeared in the `oldChildren`.

how do we determine whether a node needs to be move it ? 

it's like `basic diff`, we need the count like `lastIndex`

See the following code:


```js
if (j > oldEnd && j <= newEnd) {
  // ...
}
else if (j > newEnd && j <= oldEnd) {
  // ...
}
else {
  const count = newEnd - j + 1
  const source = Array(count).fill(-1)

  const newStart = j
  const oldStart = j

  // get key
  const keyIndex = {}
  for (let i = newStart; i < newEnd; i++)
    keyIndex[newChildren[i].key] = i

  let pos = 0
  let move = false
  let patched = 0
  for (let i = oldStart; i < oldEnd; i++) {
    oldVNode = oldChildren[i]
    if (patched < count) {
      const k = keyIndex[oldVNode.key]
      if (typeof k !== 'undefined') {
        newVNode = newChildren[k]
        patch(oldVNode, newVNode, container)
        source[k - newStart] = i
        patched++
        if (pos < k) {
        // move
          move = true
        }
        else {
          pos = k
        }
      }
      else {
      // cant find
        unmount(oldVNode)
      }
    }
    else {
    // in here,it is meaning that oldChildren.length greater than newChildren.length, so we should remove the redundant nodes
      unmount(oldVNode)
    }
  }

}
```

we define the variable `patched` that represents the updated nodes.


last but not least, how do we move the nodes ?

![image.png](https://s2.loli.net/2022/10/26/Og6wPu8cnzJReQA.png)


we will get the longest subsequence named `sep` in `source`, we just move nodes which are not in seq

> seq: [0,1]

and define two variable `s` `i`,

> s: it is a lastindex of seq
> i: it is a lastindex of oldChildren[start-end]

compare `i` with `seq[s]`,if they are not equal, we will move it

![image.png](https://s2.loli.net/2022/10/26/5xwjRZJGKSea8Nr.png)


```js
if (moved) {
  const seq = getSequence(source)
  let i = count - 1
  for (i; i >= 0; i--) {
    if (source[i] === -1) {
      // meaning the key of newChildren not in oldChildren, so we will add it
      const pos = i + newStart
      const newVNode = newChildren[pos]
      const nextpos = pos + 1
      const anchor = nextpos > newChildren.length ? newChildren[nextpos].el : null
      patch(null, newVNode, container, anchor)
    }
    else if (i !== source[i]) {
      // meaning moving
      const pos = i + newStart
      const newVNode = newChildren[pos]
      const nextpos = pos + 1
      const anchor = nextpos < newChildren.length ? newChildren[nextpos].el : null
      // move
      insert(newVNode.el, container, anchor)
    }
    else {
      // don't need move
      i--
    }
  }
}

function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI)
          u = c + 1

        else
          v = c

      }
      if (arrI < arr[result[u]]) {
        if (u > 0)
          p[i] = result[u - 1]

        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = result[u - 1]
  }

  return result
}
```


so far, the analysis of vue diff algorithm has ended.
