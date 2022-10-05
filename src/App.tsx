import { Suspense } from 'react'
import GeneratToRoute from './router/index'
import Loading from './components/loading'
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <GeneratToRoute />
    </Suspense>
  )
}

export default App
