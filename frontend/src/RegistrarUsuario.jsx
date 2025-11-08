import { Link, useNavigate } from 'react-router-dom'
import './registrar.css'


export const RegistrarUsuario = () => {
    const navigate = useNavigate()
    
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {

            const response = await fetch('http://localhost:8000/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: {}
            })

            const data = await response.json()

            if(!response.ok) {
                throw new Error(data.e)
            }

        } catch(e) {

        }
    }

    console.log('RegistrarUsuario renderizado ✓')
    
    return (
        <div className='container'>
            <form onSubmit={handleSubmit} className='register-form'>
            <h2>Registrate</h2>
                <label htmlFor="dni">DNI: </label>
                <input type="text" name="dni" id="dni" placeholder='dni' />
                <label htmlFor="nombre">Nombre: </label>
                <input type="text" name="nombre" id="nombre" placeholder='nombre' />
                <label htmlFor="apellido">Apellido: </label>
                <input type="text" name="apellido" id="apellido" placeholder='apellido' />
                <label htmlFor="direccion">Direccion: </label>
                <input type="text" name="direccion" id="direccion" placeholder='direccion' />
                <label htmlFor="telefono">Telefono: </label>
                <input type="text" name="telefono" id="telefono" placeholder='telefono' />
                <label htmlFor="contraseña">Contraseña: </label>
                <input type="password" name="contraseña" id="contraseña" placeholder='contraseña' />
                <button type="submit">Registrarse</button>
            </form>
            <Link to="/" style={{ marginTop: '20px', display: 'block', textAlign: 'center' }}>
                O haz clic aquí para volver
            </Link>
        </div>
    )
}