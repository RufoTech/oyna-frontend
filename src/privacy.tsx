import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './styles/legal.css'
import { PrivacyPage } from './legal/PrivacyPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivacyPage />
  </StrictMode>,
)
