import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from '@/hooks/useRouter'
import type { RouterTypeListProps } from '@/type'
import { TagType } from '#/page'
import type { RouterList } from '#/page'
import { clsxm } from '@/utils/helper'
interface YearsBlogList {
  [key: string]: Array<RouterList>
}

export default function PostsList({ routerType }: RouterTypeListProps) {
  const { pageList, showTag } = useRouter(routerType)
  const [currentTag, setCurrentTag] = useState<TagType>(TagType.all)
  const yearsBlogList: YearsBlogList = {}

  pageList.forEach((page: RouterList) => {
    const year = page.date?.trim().slice(-4)
    if (year) {
      if (yearsBlogList[year])
        yearsBlogList[year].push(page)

      else
        yearsBlogList[year] = [page]
    }
  })

  const [renderPageList, setRenderPageList] = useState(yearsBlogList)

  const onClickClassification = (tag: TagType) => {
    setCurrentTag(tag)
    if (tag === TagType.all) {
      setRenderPageList(yearsBlogList)

      return
    }

    setRenderPageList(() => {
      const newYearList: YearsBlogList = {}
      Object.keys(yearsBlogList).forEach((year) => {
        newYearList[year] = yearsBlogList[year].filter(page => page.tag === tag)
      })

      return newYearList
    })
  }

  return (
    <div className='w-full sm:max-w-40% flex flex-col gap-10 relative'>
      {
        showTag && (
          <>
            <div className='absolute top--3 w-30% h-.1 rounded-md border bg-dark-50 op-20' />
            <div className='fsc gap-2 text-1.5'>
              <span className="text-[#6E6E6E]">#Tag</span>
              <button
                className={
                  clsxm('leetcode-btn', currentTag === TagType.all && 'text-active')
                }
                onClick={() => onClickClassification(TagType.all)}
              >
                All
              </button>
              <button
                className={
                  clsxm('leetcode-btn', currentTag === TagType.leetcode && 'text-active')
                }
                onClick={() => onClickClassification(TagType.leetcode)}
              >
                Leetcode
              </button>
              <button className={
                clsxm('leetcode-btn', currentTag === TagType.typehero && 'text-active')
              }
                onClick={() => onClickClassification(TagType.typehero)}
              >
                Typehero
              </button>
            </div>
          </>
        )
      }
      <AnimatePresence>
        {
          Object.keys(renderPageList).reverse()?.map((year) => {
            const showYear = renderPageList[year].length > 0

            return (
              showYear && <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                key={year}
                className='w-full flex flex-col gap-5 relative'
              >
                <div
                  className='font-mono text-8em font-bold w-full px-3 absolute opacity-10 top--2rem left--3rem
                      z--1'
                >
                  {year}
                </div>

                <div>
                  {
                    renderPageList[year]?.map((page) => {
                      const { display = true } = page

                      return display && <Link
                        key={page.title}
                        to={page.path ?? '/'}
                        className='block w-full box-hover px-3 py-5'
                      >
                        <div className='w-full fbc'>
                          <h1 className='text-xl max-w-max'>{page.title || 'blog'}</h1>
                          <div className='fec gap-3 text-15px'>
                            <span className='over-desc op-30 hover:op-40'>#{page.tag}</span>
                            <span className='op-20 mr-3'>{page.language || ''}</span>
                          </div>

                        </div>
                        <div className='w-full fbc gap-3 md:gap-15 mt-3 text-sm opacity-60'>

                          <span className='over-desc'>{page.desc}</span>
                          <span className='md:min-w-90px'>{page.date?.slice(0, -5)}</span>
                        </div>
                      </Link>
                    },
                    )
                  }
                </div>
              </motion.div>
            )
          })
        }
      </AnimatePresence>
    </div>
  )
}
