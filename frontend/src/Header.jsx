import './index.css'

export function Header() {
    
    return (
        <header className="header">
            <img id='logo-clinica' src="/logo-clinica.svg" alt="logo de la clinica" /> <h1 id='title'>CLINICA <span style={{color: '#0780df'}}>
                SALUD</span></h1>
        </header>
    )
}