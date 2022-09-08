import type { RouteObject } from 'react-router-dom'
import { useRoutes } from 'react-router-dom'
import { render } from 'react-dom'
import Posts from '../views/posts'
import Home from '../views/home'

// async function getDynamicRoute(route: string) {
//   const node = await import(`../views/${route}.tsx`)
//   const { default: com } = node

//   return com()
// }
// getDynamicRoute('home')

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home/>,
  },
  {
    path: '/posts',
    element: <Posts />,
  },
]

export default function GeneratToRoute() {
  return (
  <div>
    {useRoutes(routes)}
  </div>
  )
}
