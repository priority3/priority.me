/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client-react" />
declare module '*.md' {
  import type React from 'react'
  const ReactComponent: React.VFC
  export default ReactComponent
}
