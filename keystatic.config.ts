import { collection, config, fields } from '@keystatic/core'

/**
 * Local-mode CMS. Admin UI at /keystatic during `pnpm dev` only
 * (site remains `output: 'static'` for production).
 *
 * Content files stay Markdown with YAML frontmatter under src/content/*.
 */
export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: { name: 'priority.me' },
  },
  collections: {
    blogs: collection({
      label: 'Blogs',
      slugField: 'title',
      path: 'src/content/blogs/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            validation: { isRequired: true },
          },
        }),
        author: fields.text({
          label: 'Author',
          defaultValue: 'priority',
        }),
        date: fields.date({
          label: 'Date',
          validation: { isRequired: true },
        }),
        desc: fields.text({
          label: 'Description',
          multiline: true,
        }),
        subtitle: fields.text({
          label: 'Subtitle',
        }),
        language: fields.text({
          label: 'Language',
          description: 'e.g. CN, EN, EN/CN',
        }),
        display: fields.checkbox({
          label: 'Display on site',
          defaultValue: true,
        }),
        content: fields.markdoc({
          label: 'Content',
          options: {
            formatting: true,
            dividers: true,
            links: true,
            tables: true,
            image: {
              directory: 'public/images/blogs',
              publicPath: '/images/blogs/',
            },
          },
        }),
      },
    }),

    leetcode: collection({
      label: 'Leetcode',
      slugField: 'title',
      path: 'src/content/leetcode/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            validation: { isRequired: true },
          },
        }),
        author: fields.text({
          label: 'Author',
          defaultValue: 'priority',
        }),
        date: fields.date({
          label: 'Date',
          validation: { isRequired: true },
        }),
        desc: fields.text({
          label: 'Description',
          multiline: true,
        }),
        language: fields.text({
          label: 'Language',
          description: 'e.g. CN, EN, EN/CN',
        }),
        display: fields.checkbox({
          label: 'Display on site',
          defaultValue: true,
        }),
        tag: fields.select({
          label: 'Tag',
          options: [
            { label: 'leetcode', value: 'leetcode' },
            { label: 'typehero', value: 'typehero' },
          ],
          defaultValue: 'leetcode',
        }),
        content: fields.markdoc({
          label: 'Content',
          options: {
            formatting: true,
            dividers: true,
            links: true,
            tables: true,
            image: {
              directory: 'public/images/leetcode',
              publicPath: '/images/leetcode/',
            },
          },
        }),
      },
    }),
  },
})
