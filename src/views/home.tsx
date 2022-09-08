import { useNavigate } from 'react-router-dom'
import Header from '../components/header'
export default function Home() {
  const navigate = useNavigate()

  return (
    <div>
      <Header />
      <div className="fc w-full mt-20" >
          <div onClick={() => navigate('/posts', { replace: true })}>just go posts</div>
      </div>
    </div>
  )
}
