export const isString = (val: unknown): val is string => typeof val === 'string'

export const isClient = typeof window !== 'undefined'
export const defaultWindow = isClient ? window : undefined

export const noop = () => {}
