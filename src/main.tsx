import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './styles/header.css'
import './styles/mid.css'
import './styles/phone.css'
import './styles/closing.css'
import './styles/cursor.css'
import './styles/preloader.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
