import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './registrar.css'


export const RegistrarUsuario = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState(
    {
        dni: '',
        nombre: '',
        apellido: '',
        direccion: '',
        telefono: '',
        contraseña: ''

    })

    const [error, setError] = useState(null)
    const [loading,setLoading] = useState(false)
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value 
        })
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {

            const response = await fetch('http://localhost:8000/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dni: parseInt(formData.dni),
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    direccion: formData.direccion,
                    telefono: formData.telefono,
                    contraseña: formData.contraseña
                })
            })

            const data = await response.json()

            if(!response.ok) {
                throw new Error(data.detail || 'Error al registrar')
            }

            alert("Usuario resgistrado exitosamente")
            navigate('/')

        } catch(e) {
            setError(e.message || "Error al registrar usuario")

        }finally {
            setLoading(false)
        }
    }

    console.log('RegistrarUsuario renderizado ✓')
    
    return (
        <div className='container'>
            <form onSubmit={handleSubmit} className='register-form'>
            <h2>Registrate</h2>

            {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
            
                <label htmlFor="dni">DNI: </label>
                <input type="number" name="dni" id="dni" placeholder='Dni...'
                value={formData.dni} onChange={handleChange} required />
                <label htmlFor="nombre">Nombre: </label>
                <input type="text" name="nombre" id="nombre" placeholder='Nombre...'
                value={formData.nombre} onChange={handleChange} required />
                <label htmlFor="apellido">Apellido: </label>
                <input type="text" name="apellido" id="apellido" placeholder='Apellido...'
                value={formData.apellido} onChange={handleChange} required />
                <label htmlFor="direccion">Email: </label>
                <input type="email" name="direccion" id="direccion" placeholder="email@ejemplo.com..."
                value={formData.direccion} onChange={handleChange} required />
                <label htmlFor="telefono">Telefono: </label>
                <input type="text" name="telefono" id="telefono" placeholder='Telefono...' 
                value={formData.telefono} onChange={handleChange} required />
                <label htmlFor="contraseña">Contraseña: </label>
                <input type="password" name="contraseña" id="contraseña" placeholder='Contraseña...'
                value={formData.contraseña} onChange={handleChange} required minLength={6} />
                <button type="submit" disabled={loading}> {loading ? 'Registrando...' : 'Registrarse'} </button>
            </form>

            <Link to="/" style={{ marginTop: '20px', display: 'block', textAlign: 'center' }}>
                O haz clic aquí para volver
            </Link>
        </div>
    )
}