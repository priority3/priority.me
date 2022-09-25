import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import App from './App'

import 'uno.css'
import '@unocss/reset/tailwind.css'
import './style.css'

const app = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

app.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
