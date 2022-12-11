import { useEffect } from 'react'
import {
  defaultWindow,
  isString,
  noop,
} from '@/utils'

export type Fn = () => void
export interface GeneralEventListener<E = Event> {
  (evt: E): void
}

// interface InferEventTarget<Events> {
//   addEventListener(event: Events, fn?: any, options?: any): any
//   removeEventListener(event: Events, fn?: any, options?: any): any
// }

// the type supported

export function useEventListener<Names extends string, EventType = Event>(
  target: HTMLElement | Document | Window | null,
  event: Names,
  listener: GeneralEventListener<EventType>,
  options?: boolean | AddEventListenerOptions
): Fn

export function useEventListener(
  ...args: any[]
) {
  let target: EventTarget | undefined
  let event: string
  let listener: any
  let options: any

  if (isString(args[0])) {
    [event, listener, options] = args
    target = defaultWindow
  }
  else {
    [target, event, listener, options] = args
  }

  if (!target)
    return noop

  let cleanup = noop

  useEffect(() => {
    cleanup()

    if (!target)
      return

    target.addEventListener(event, listener, options)

    cleanup = () => {
      target?.removeEventListener(event, listener, options)
      cleanup = noop
    }
  }, [target])

  return () => {
    cleanup()
  }
}
