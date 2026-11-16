import React from 'react'
import ReactDOM from 'react-dom/client'
import gsap from 'gsap'
import App from './App.jsx'
import './index.css'

gsap.ticker.lagSmoothing(0)

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
