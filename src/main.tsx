import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrimeReactProvider } from 'primereact/api'
import AppRoot from './AppRoot'

import 'primereact/resources/themes/lara-light-teal/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './styles/global.css'

const primeReactConfig = {
  ripple: true,
  inputStyle: 'filled' as const,
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrimeReactProvider value={primeReactConfig}>
      <AppRoot />
    </PrimeReactProvider>
  </React.StrictMode>,
)
