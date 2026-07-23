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
  // Keystatic select may write ""; treat as unset
  tag: z.preprocess(
    val => (val === '' || val == null ? undefined : val),
    z.enum(['leetcode', 'typehero']).optional(),
  ),
})

// Keystatic markdoc field may save as .mdoc; keep loading both.
const contentPattern = '**/*.{md,mdoc}'

const blogs = defineCollection({
  loader: glob({ pattern: contentPattern, base: './src/content/blogs' }),
  schema: postSchema,
})

const leetcode = defineCollection({
  loader: glob({ pattern: contentPattern, base: './src/content/leetcode' }),
  schema: postSchema,
})

export const collections = { blogs, leetcode }
