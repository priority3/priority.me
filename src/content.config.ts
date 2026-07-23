import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const postSchema = z.object({
  title: z.string(),
  author: z.string().default('priority'),
  date: z.coerce.date(),
  desc: z.string().optional(),
  subtitle: z.string().optional(),
  language: z.string().optional(),
  display: z.boolean().default(true),
  tag: z.enum(['leetcode', 'typehero']).optional(),
})

const blogs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blogs' }),
  schema: postSchema,
})

const leetcode = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/leetcode' }),
  schema: postSchema,
})

export const collections = { blogs, leetcode }
