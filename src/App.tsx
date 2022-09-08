import { Suspense } from 'react'
import GeneratToRoute from './router/index'
function App() {
  return (
    <Suspense fallback={<p> loading... </p>}>
      <GeneratToRoute />
    </Suspense>
  )
}

export default App
