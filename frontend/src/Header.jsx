import './index.css'
import { useAuth } from './AuthContext'

// Se agregó una clase para agrupar el logo con el título correctamente alineado
export function Header({ compact = false }) {
    const { user } = useAuth()
  return (
    <>
            <header className={`header ${compact ? 'header-compact' : ''}`}>
        <div className="header-left">
            <img id="logo-clinica" src="/logo-clinica.svg" alt="logo de la clinica" />
            <h1 id="title">
            CLINICA <span style={{ color: '#0780df' }}>SALUD</span>
            </h1>
        </div>
    
        {user && (
            <div className="header-right">
            <img
            src="/person-circle.svg"
            id="person-logo"
            alt="person logo"
            style={{ width: 40 }}
            />
            <span>{user.usuario}</span>
        </div>
        )}

        </header>
  </>
  )
}
