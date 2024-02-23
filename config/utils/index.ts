import { resolve } from 'path'

export * from './date'

export function getFileCwd(file: string) {
  return resolve(process.cwd(), file)
}
