// import type { RouteObject } from 'react-router-dom'
import { useRoutes } from 'react-router-dom'
import Home from '../views/home'
import routes from '~react-pages'
import Header from '@/components/header'
routes.push({
  path: '/',
  element: <Home/>,
})

export default function GeneratToRoute() {
  return (
  <div>
    <Header />
    {useRoutes(routes)}
  </div>
  )
}

export {
  routes,
}
