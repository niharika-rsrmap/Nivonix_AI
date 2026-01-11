import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './ToastContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <GoogleOAuthProvider clientId="340273851214-te11ivt82uuosp8eg4pghchhg8sua45d.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </ToastProvider>
  </StrictMode>,
)
