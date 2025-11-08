import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './login.css'
import { useAuth } from './AuthContext'
// #51acea color para calendario de turnos
// #d3d5d4 color para letras claras
// #ebeff8 color para hero dashboard

export function Login() {
    const { login } = useAuth()
    const [direccion, setDireccion] = useState('')
    const [contraseña, setContraseña] = useState('')
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        //Por ahora navega directo al dashboard (sin validar)

        try {

            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ direccion, contraseña })
            })
            
            const data = await response.json()
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const msg = errorData?.detail || 'Error en la petición'
                setError(msg)
                console.error(msg)
                return
            }
            login(data)
        } catch(e) {
            setError('Error de conexión con el servidor')
            console.error(e)
        }

    }
    return (
        <>
            <form className='login-form' onSubmit={handleSubmit}>
                    <h2 className="login-title">Accede a tu cuenta</h2>
                    {error && <p style={{color: 'red'}}>{error}</p>}
                    <input type="text" id="username" name="username" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder='usuario'/>
                    <br />
                    <input type="password" id="password" name="password" value={contraseña} onChange={(e) => setContraseña(e.target.value)} placeholder='contraseña' />
                    <br />
                    <p id='continua'>O continua con</p>
                        <a className='logos' target='blank' href='https://www.google.com/?hl=es&safe=active&ssui=on'><img src="/google.svg" id='google-logo' alt="google logo" /></a>
                    <button type="submit">Iniciar sesión</button>
                    <p style={{color: 'black'}}>No tienes una cuenta? <a href="">Registrarse</a></p>
            </form>
        </>
    )
}