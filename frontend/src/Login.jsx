import './login.css'
// #51acea color para calendario de turnos
// #d3d5d4 color para letras claras
// #ebeff8 color para hero dashboard

export function Login() {
    return (
        <div>
            <form className='login-form' action="">
                <h2 className="login-title">Accede a tu cuenta</h2>
                <input type="text" id="username" name="username" placeholder='usuario'/>
                <br />
                <input type="password" id="password" name="password" placeholder='contraseña' />
                <br />
                <p id='continua'>O continua con</p>
                    <a className='logos' target='blank' href='https://www.google.com/?hl=es&safe=active&ssui=on'><img src="/google.svg" id='google-logo' alt="google logo" /></a>
                <button type="submit">Iniciar sesión</button>
                <p style={{color: 'black'}}>No tienes una cuenta? Crea una <a href="">Registrase</a></p>
            </form>
        </div>
    )
}