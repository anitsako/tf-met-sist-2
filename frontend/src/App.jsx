import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { Login } from './Login'
import { Dashboard } from './Dashboard'
import { Header } from './Header'

function App() {
  return (
    <BrowserRouter>
    <Routes>
      {/*Ruta del Login (Pagina inicial) */}
      <Route path="/" element={
      <>
        <Header />
        <Login />
      </>
     } />

     {/*Ruta del Dashboard */}
     <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
    </BrowserRouter>
    
  )
}

export default App
