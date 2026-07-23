export const site = {
  name: 'P.',
  title: 'P. · raze',
  description: "raze's personal site — notes, projects, and leetcode.",
  author: 'raze',
  url: 'https://priority-me.netlify.app',
  github: 'https://github.com/priority3',
}

export const nav = [
  { label: '首页', href: '/' },
  { label: '文稿', href: '/posts' },
  { label: 'Leetcode', href: '/leetcode' },
] as const

export const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/priority3',
    icon: 'github' as const,
  },
  {
    name: 'Bilibili',
    href: 'https://space.bilibili.com/94544300',
    icon: 'bilibili' as const,
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/prioriycc',
    icon: 'twitter' as const,
  },
  {
    name: 'Juejin',
    href: 'https://juejin.cn/user/3466114142048472/posts',
    icon: 'juejin' as const,
  },
  {
    name: 'Posts',
    href: '/posts',
    icon: 'posts' as const,
  },
  {
    name: 'Leetcode',
    href: '/leetcode',
    icon: 'leetcode' as const,
  },
] as const

export const projects = [
  {
    name: 'vite-plugin-react-markdown',
    description: 'Use markdown in React & Vite',
    href: 'https://github.com/priority3/vite-plugin-react-markdown',
  },
  {
    name: 'leetcode-daily',
    description: 'Daily algorithms in TS / Python / Rust',
    href: 'https://github.com/priority3/rookie-Algorithm',
  },
  {
    name: 'p-typewriter',
    description: 'Typewriter component for Vue 3',
    href: 'https://github.com/priority3/p-typewriter',
  },
] as const
