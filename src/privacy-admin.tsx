import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './styles/legal.css'
import { PrivacyAdminPage } from './legal/PrivacyAdminPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivacyAdminPage />
  </StrictMode>,
)
