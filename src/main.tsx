import React from 'react'
import ReactDOM from 'react-dom/client'
import { Agentation } from 'agentation'
import '@fontsource-variable/geist'
import App from './App'
import './shadcn.css'
import './styles.css'
import { Toaster } from './components/ui/sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster theme="dark" position="bottom-center" closeButton duration={4500} />
    {import.meta.env.DEV && <Agentation />}
  </React.StrictMode>,
)
