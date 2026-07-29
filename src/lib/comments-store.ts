/**
 * slug → GitHub issue number map (Netlify Blobs + memory fallback).
 */

import { getStore } from '@netlify/blobs'

const STORE_NAME = 'comments'
const STORE_KEY = 'issue-map'

export type IssueMap = Record<string, number>

let memory: IssueMap = {}

function canUseBlobs() {
  return Boolean(
    process.env.NETLIFY ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      process.env.NETLIFY_DEV,
  )
}

export async function readIssueMap(): Promise<IssueMap> {
  if (canUseBlobs()) {
    try {
      const store = getStore(STORE_NAME)
      const data = (await store.get(STORE_KEY, { type: 'json' })) as IssueMap | null
      if (data && typeof data === 'object') {
        memory = { ...data }
        return { ...data }
      }
    } catch (err) {
      console.warn('[comments] Blobs read failed, using memory', err)
    }
  }
  return { ...memory }
}

export async function writeIssueMap(map: IssueMap): Promise<void> {
  memory = { ...map }
  if (!canUseBlobs()) return

  try {
    const store = getStore(STORE_NAME)
    await store.setJSON(STORE_KEY, map)
  } catch (err) {
    console.warn('[comments] Blobs write failed; kept in memory only', err)
  }
}
