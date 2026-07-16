import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { initTheme } from './hooks/useTheme'

// Antes del primer render: evita que el fondo 3D arranque en dark y salte a light.
initTheme()

// Sin <StrictMode>: en dev, React 19 monta dos veces y drei's <Scroll html>
// llama ReactDOM.createRoot() sobre el mismo contenedor (state.fixed) dos veces
// → warning "createRoot() on a container that has already been passed".
createRoot(document.getElementById('root')!).render(<App />)
