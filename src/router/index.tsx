// import type { RouteObject } from 'react-router-dom'
import { useLocation, useRoutes } from 'react-router-dom'
import Home from '../views/home'
import routes from '~react-pages'
import Header from '@/components/header'
import Footer from '@/components/footer'
routes.push({
  caseSensitive: true,
  path: '/',
  element: <Home />,
})

export default function GeneratToRoute() {
  const { pathname } = useLocation()

  return (
    <div>
      <Header />
      {useRoutes(routes)}
      {
        pathname !== '/' && pathname !== '/home'
        && <div
          className="mt-10 mb-6 m-auto opacity-50 fcc hover:op-75 cursor-pointer w-max"
          onClick={() => window.history.back()}
        >
          cd..
        </div>
      }
      <Footer />
    </div>
  )
}

export {
  routes,
}
