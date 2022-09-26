// import type { RouteObject } from 'react-router-dom'
import { useRoutes } from 'react-router-dom'
import Home from '../views/home'
import routes from '~react-pages'
routes.push({
  path: '/',
  element: <Home/>,
})

export default function GeneratToRoute() {
  return (
  <div>
    {useRoutes(routes)}
  </div>
  )
}

export {
  routes,
}
