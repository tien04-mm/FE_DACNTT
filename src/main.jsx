import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// --- MSW ĐÃ ĐƯỢC TẮT ĐỂ KẾT NỐI BACKEND THẬT ---
// async function enableMocking() {
//   if (import.meta.env.PROD) { 
//     return;
//   }
//   const { worker } = await import('./mocks/browser.js');
//   return worker.start({
//     onUnhandledRequest: 'bypass', 
//   });
// }
// -----------------------------------------------

// Render trực tiếp không qua MSW - Request sẽ đi qua Vite Proxy đến Backend thật
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);