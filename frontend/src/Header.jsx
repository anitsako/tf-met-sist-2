import './index.css'

//Se agrego una propiedad (compact) para quitar el espacio entre el header y la pagina solo en el Dashboard
export function Header({ compact = false }) {
    
    return (
        <header className={`header ${compact ? 'header-compact' : ''}`}>
            <img id='logo-clinica' src="/logo-clinica.svg" alt="logo de la clinica" /> <h1 id='title'>CLINICA <span style={{color: '#0780df'}}>
                SALUD</span></h1>
        </header>
    )
}