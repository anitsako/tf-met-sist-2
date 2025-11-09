import { useEffect, useState } from 'react'
import { set, useForm } from 'react-hook-form'
import { api } from './api'
import { NavLink } from 'react-router-dom'

export function TurnoForm({ onCreated }) {
  const [list, setList] = useState([])
  const { register, handleSubmit, reset } = useForm()
  const [pacientes, setPacientes] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')

  const cargar = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/turnos')
      setList(response.data)

    } catch(e) {
        console.error('Error cargando los turnos: ', e.response?.data || e.message)
        setError("No se pudieron cargar los turnos")
    } finally {
      setLoading(false)
    }
  }

    useEffect(() => {
    Promise.allSettled([api.get('/pacientes'), api.get('/profesionales')])
      .then(([p, pr]) => {
        if (p.status === 'fulfilled') setPacientes(p.value.data)
        if (pr.status === 'fulfilled') setProfesionales(pr.value.data)
      })
      cargar()
  }, [])

  const onSubmit = async (data) => {
    const turno = {
      paciente_id: parseInt(data.paciente_id),
      profesional_id: parseInt(data.profesional_id),
      fecha: data.fecha,
      hora: data.hora,
    }

    try {
      await api.post('/turnos', turno);
      reset();
      onCreated?.();
    } catch (e) {
      alert(e?.response?.data?.detail || 'Error creando turno');
    }
  }

  const onDelete = async (id) => {
    if(!confirm('¿Deseas eliminar este turno?')) return
    setLoading(true)
    try {
      await api.delete(`/turnos/${id}`)
      await cargar()

    } catch(e) {
      console.error('Error eliminando el turno: ', e.response?.data || e.message)
      setError('No se pudo eliminar el turno')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>

      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
          <div className="container-fluid">
            <ul className="nav nav-tabs border-0">
              <li className="nav-item">
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/pacientes" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Pacientes
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/calendario" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Calendario
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/especialidades" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Especialidades
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/reportes" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Reportes
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/profesionales" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Profesionales
                </NavLink>
              </li>
            </ul>

            <div className="ms-auto d-flex align-items-center">
              <span className="me-3">
              </span>
            </div>
          </div>
        </nav>

      <div className='container py-5'>
      <h1>Nuevo Turno</h1>
        <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="col-md-6">
            <label className="form-label">Paciente</label>
            <select className="form-select" {...register('paciente_id', { required: true })}>
              <option value="">Seleccione…</option>
              {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Profesional</label>
            <select className="form-select" {...register('profesional_id', { required: true })}>
              <option value="">Seleccione…</option>
              {profesionales.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Fecha</label>
            <input type="date" className="form-control" {...register('fecha', { required: true })}/>
          </div>

          <div className="col-md-6">
            <label className="form-label">Hora</label>
            <input type="time" className="form-control" {...register('hora', { required: true })}/>
          </div>

          <div className="col-12">
            <button className="btn btn-primary" type="submit">Guardar</button>
          </div>
        </form>
      </div>

      <div className="card">
          <div className="card-body">
            {loading ? (
              'Cargando…'
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Paciente</th>
                      <th>Profesional</th>
                      <th>Especialidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.fecha}</td>
                        <td>{p.hora}</td>
                        <td>{p.paciente}</td>
                        <td>{p.profesional ?? ''}</td>
                        <td>{p.especialidad ?? ''}</td>
                        <td>{p.estado ?? ''}</td>
                        <td className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(p.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {list.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">
                          Sin Turnos
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
    </>
  )
}
