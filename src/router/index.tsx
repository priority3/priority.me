import { Route, Routes } from 'react-router-dom'
import Home from '../views/home'
import Posts from '../views/posts'
// TODO danamic import
// const routePge
//   = Object.entries(
//     import.meta.glob<{ default: any }>('../views/*.tsx', { eager: true }))
//     .map(([key, value]) => {
//       const reg = /\/views\/(.*)\.tsx/

//       return [reg.exec(key)?.[1], value.default]
//     })
export default function GeneratToRoute() {
  return (
    <div>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/posts" element={<Posts />} />

    </Routes>
  </div>
  )
}
