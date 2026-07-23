---
title: Why the blog?
desc: Why I make the blog website
date: 2022-10-05
author: priority
language: CN
---



## 我的个人Blog

hey 🤣, 我是 [prioriry](https://github.com/priority3)

目前的个人网站 [Blog](https://priority-me.netlify.app/)，这篇文章记录一下个人博客中的一些问题🙄

### Why the Blog ?
受到 [antfu](https://github.com/antfu) & [Diu](https://github.com/ddiu8081) 的启发和影响，并且非常喜欢他们Blog的clean风格，同时也是想要记录一些自己的学习和生活。

(tips： 原谅我抄了很多他们的东西🤣) 

于是有了自己去搭建一个博客网站的想法。

其实大一的时候就有用hexo搭建过自己[博客网站](https://priority3.github.io/)， 不过上一次更新已经是在一年多以前了。再加上电脑格式化过一次，虽然代码都放在了github，但是已经没有拉代码再去更新的欲望😶。

### ✨技术上

对于相对熟悉Vue的我，选择了react， **仅仅** 是因为想要熟悉更多的东西

**Technology stack**: ts、react、unocss、vite

好吧，写完之后我想到了某次antfu直播间有人问道的问题：
> q: 如何评价react？(类似) 
> 
> antfu: ~~不要用~~ ,

> 在使用的过程当中很多的东西我想参照Vue的生态写法来完成，并且项目上的架构也希望采用antfu的个人博客一样，当然了一切从简，于是基于vite去搭建了react的项目。 但是... （还是我太菜了😢）

起初对于怎么去应用markdown来做为笔记，我google了一下常见的解决方案是采用[react-markdown](https://github.com/remarkjs/react-markdown)， 按照文档使用起来一切良好，并且dev本地ok，但是基于vite的打包让我遇到了一些问题。于是我在猜想是否有相应的插件可以解决这样的问题。(在记录这篇Blog的时候，再去索引了一下解决方案，也许[issue](https://github.com/vitejs/vite/issues/3592)能够解决)

于是再次随便google了一下 `vite-plugin-react-markdown` , 发现了[vite-plugin-react-markdown](https://github.com/geekris1/vite-plugin-react-markdown)，但是综合了一下，存在了一些问题，于是我选择~~copy~~一份，可以查看[@pity/vite-plugin-react-markdown](https://github.com/priority3/vite-plugin-react-markdown)来了解更多。也算是让我熟悉了一把vite的插件开发。🤐


### code 上
* 我都好奇我自己为什么写出了这样的代码🤣，正则去匹配了iso-8601的时间，我想转成一个local time处理，发现正则的输入其实就是这个时间，当然也可以用Date做处理，不过我打算在下一次做代码分离的时候再改掉它。
```js
// TODO iso-8601 to time
const date = /.*/.exec(data.date)![0].slice(0, 15)
```

> **before:** 2022-08-08T00:00:00.000Z
> 
> **after:** Mon Aug 08 2022

* 在jsx这样的写法，我始终认为不够精简 

```jsx
const titleContent = () => {
    let title, date, subtitle
    if (attributes.title)
      title = <h1>{attributes.display ?? attributes.title}</h1>
      // attributes.date(iso) -> curPage.date(local time)
    if (curPage.date) {
      date = <p className='opacity-50 !-mt-2'>
          {curPage.date}
      </p>
    }
    if (attributes.subtitle || attributes.desc) {
      subtitle = <p className='opacity-50 !-mt-6 italic'>
      {attributes.subtitle ?? attributes.desc}
    </p>
    }

    return (
      <div className='m-auto prose mb-10'>
        {title}
        {date}
        {subtitle}
      </div>
    )
  }
  
  
  
 <div>
    {
      (attributes.display ?? attributes.title)
      && titleContent()
    }
 </div>
```

### 📝 完善

**all in all**，项目整体十分简单，不过也还算不错，学习的过程ing...

后续应该会再把blog的**目录**和**分类**加上，以及优化一下css代码，有点乱。
maybe 考虑自己DIY一个markdown主题美化一下blog？

再然后，也许自己还会再去换新一下blog home，毕竟借鉴居多🤣，让自己糟糕的设计天赋得到一次升华，hhh

待定...

### 最后

贴上一个[code](https://github.com/priority3/priority.me)地址，如果你感兴趣欢迎 star ✨


