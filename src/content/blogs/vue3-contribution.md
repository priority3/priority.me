---
author: priority
title: vue3 组件库的贡献
date: 2022-08-08
desc: Vue3 组件库,添加一行代码，成为了大型开源项目的贡献者
language: CN
---



<!-- ![coding.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/995a979d7470447d8b5719c739d25a6f~tplv-k3u1fbpfcp-watermark.image?) -->

☠菜鸡日志👾

项目地址：[naive-ui](https://github.com/TuSimple/naive-ui) 

开始之前：
> 在写网页的时候需要用到第三方ui框架，项目的技术栈为Vue3+ts，因为种种原因我选择了NaiveUI(🤔现在NaiveUI的start数已经是9.9k了)。

### 遇到的第一个bug
在实际的使用当中用到了一个carousel(轮播图)组件。然后遇到一个需求，组件是自带loop(循环播放)的，需要在hover的时候，停止轮播。
"
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/54abde32b97442638192b6976bac030e~tplv-k3u1fbpfcp-watermark.image?)

那么在官网的定义中我看到一个**autoplay**属性，于是可以想当然的绑定 **@mouseenter @mouseleave** 动态的修改autoplay的值，但是好像并不能够及时的生效，每次hover时都需要轮播过1至2张图片的时候才会停止，然后疯狂本地debug也并没有发现什么问题，感觉像是vue一次渲染周期没有及时地监听到autoplay的改变。

#### 提出问题
于是我在naive的issue搜索相关的问题但是并没有找到相关的答案。之后便在codesandbox去复现我的问题：[复现链接](https://codesandbox.io/s/crazy-bird-3ossou?file=/src/components/demo.vue)，发现当时最新版本(2.30.0)的naive-ui也有同样的问题。我便去提出了一个issue。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c14730f64c274c32831c00ae368a660f~tplv-k3u1fbpfcp-watermark.image?)

有意思的是：
> 在当时issue下也有其他人需要到了相同的问题，并且询问我是否解决了，不过我并没有😐 被自己菜哭 😭，后来因为这个bug被修复了所以就等着新版本的然后应用了😂

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3341956c99f94cd681154812248917bc~tplv-k3u1fbpfcp-watermark.image?)

这个问题很快被其他大佬修复了，原理大致就是在组件内部上去绑定了mouseenter和mouseleave，执行去判断props的autoplay的值来判断是否需要开启autoplay。



![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ed62a693a5e4e97bd18c0ea3d494bb6~tplv-k3u1fbpfcp-watermark.image?)
> 具体更改autoplay的原理大家可以自己下载源码看看。


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c9f3356498d469f846affa0b740ed82~tplv-k3u1fbpfcp-watermark.image?)

> 虽然这次遇到的bug并没有自己去解决，不过这也促使了我后面去提交pr。


### 遇到的第二个bug
同样是carousel(轮播图)组件，在我的项目当中轮播图内部只有两个item同时我需要autoplay和loop(自动播放并且循环)，于是便出现了切换效果相反的bug，效果如下：

![loop.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/63ced1a454b54f0fa0ed5f65302c36a1~tplv-k3u1fbpfcp-watermark.image?)

#### 定位bug
在一开始我同样是觉得我的项目上是因为有什么东西影响到了组件，于是开始本地疯狂debug，但我返现当组件内部有3个item时效果是完全ok的，但我至此也始终还没有怀疑组件内部问题，我是如此相信你~

![twoitem.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5929b8eca8784ca3a68d3ce4ee82168e~tplv-k3u1fbpfcp-watermark.image?)

我甚至也因此新开了一个项目引入naive-ui和在codesandbox分别去实验，我都发现在相同的情况下都有类似的问题，于是我确定了是组件内部的问题。有了上一次的经验再加上我更想去自己解决问题(想水一个pr🥺)于是便又去提了一个issue：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/efbb26118f5645bd8bb75be1b5416edb~tplv-k3u1fbpfcp-watermark.image?)

然后便去fork了代码。定位到carousel组件开始找bug。

### 解决问题
#### 分析

一开始我会去思考这个效果是为什么导致的，于是在控制台查看dom元素：


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9b61fe073dda4456b8fce6cd11627b10~tplv-k3u1fbpfcp-watermark.image?)

可以很清楚的看到，这是naive-ui官网上的carousel，在页面上我们是有4个item，但是在dom元素中我们可以看到他是有6个这样的节点。 **(实际上的dom的定位是我在本地两个item下看到了四个dom节点)** 这样做的目的就是为了从第一个切换到最后一个 和 从最后一个切换到第一个 的过渡不会直接从中间过渡过去，这会有一个页面闪烁的问题。

然后也可以很清晰的看到每次的切换都是translate做的切换，那么这样便大概知道是怎么实现得了。 

#### 源码解读

在开始源码的时候，值得一提的是：
> 在每个开源项目的README当中都有 **contributing** , 请记得在提交pr之前仔细阅读。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c46aafafa80749af897b0e898bca4cc6~tplv-k3u1fbpfcp-watermark.image?)


源码的阅读是一件挺麻烦的事，当我打开carousel文件的代码时发现一个文件有一千行代码，虽然听着不是很多，但是在一个全是逻辑的代码有1000行，我感觉还是很头大的，所以这并不可能一行一行去解读。(**其实主要是我太菜了😭**) 

这个时候就是按照我的思路ctrl+F 大致的看看咯，因为在先前我就定位到了是translate的切换于是就去看他每次切换的过程是怎样，然后看看当引起切换的时候去执行了哪些流程。

于是我便定位到了watch当中监听realIndexRef变换执行的translateTo做的切换，如下：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7ee2868b728043bfab66caddcd097ceb~tplv-k3u1fbpfcp-watermark.image?)

其实在这里做了很多输出，大致了解写每个字段意义。
#### 解决
那么既然在两个item下会有问题，在么两个item下不走loop这段逻辑就行了，于是我加上了这样的一段代码。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/95f3bc6ad01f433dbbbc46d5c575384f~tplv-k3u1fbpfcp-watermark.image?)

然后测试，发现解决了😂 之后我便提交了pr等待回应了。 为了得到更好的建议，我在readme中看到了交流群，于是便在群中也提出了这个pr，这样应该可以得到作者更快的回复。


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0ba7e34adc6843c38b0b48268c11dd4e~tplv-k3u1fbpfcp-watermark.image?)

之后在pr当中我也得到了作者大大以及其他大佬的建议，最后才是我上面一行代码的呈现。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27925ce4b9904a3c8e1ca3f154414f5b~tplv-k3u1fbpfcp-watermark.image?)

同时一些其他大佬也直接给出了更加合理的写法我也是直接参考了这个，这也是经过反复修改有了上述的一行代码。

> 最后感谢作者大大以及给我提出建议的大佬😹


[项目issue地址](https://github.com/TuSimple/naive-ui/issues/3413)
