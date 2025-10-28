import { useNavigate } from 'react-router-dom'
import './login.css'

// #51acea color para calendario de turnos
// #d3d5d4 color para letras claras
// #ebeff8 color para hero dashboard

export function Login() {
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        //Por ahora navega directo al dashboard (sin validar)
        navigate('/dashboard')
    }
    return (
        <div>
            <form className='login-form' onSubmit={handleSubmit}>
                <h2 className="login-title">Accede a tu cuenta</h2>
                <input type="text" id="username" name="username" placeholder='usuario'/>
                <br />
                <input type="password" id="password" name="password" placeholder='contraseña' />
                <br />
                <p id='continua'>O continua con</p>
                    <a className='logos' target='blank' href='https://www.google.com/?hl=es&safe=active&ssui=on'><img src="/google.svg" id='google-logo' alt="google logo" /></a>
                <button type="submit">Iniciar sesión</button>
                <p style={{color: 'black'}}>No tienes una cuenta? <a href="">Registrarse</a></p>
            </form>
        </div>
    )
}