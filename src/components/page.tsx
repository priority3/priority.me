import type { ReactNode } from 'react'
import React from 'react'
interface Props {
  attributes: Record<string, any>
  importComponentName: string[]
  children: ReactNode
}
export const PropsContext = React.createContext<Props | null>(null)
function Page(props: Props) {
  const { children, importComponentName } = props
  if (importComponentName.includes('BlogList'))
    return children

  return (
    <PropsContext.Provider value={props}>
      <div className="page-container m-auto p-8 lt-md-p-l-0 lt-md-p-r-0">{children}</div>
    </PropsContext.Provider>
  )
}
export default Page
