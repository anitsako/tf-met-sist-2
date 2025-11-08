import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { api } from './api'
import { Header } from './Header'
import { NavLink } from 'react-router-dom'

export function TurnoForm({ onCreated }) {
  const { register, handleSubmit, reset } = useForm()
  const [pacientes, setPacientes] = useState([])
  const [profesionales, setProfesionales] = useState([])

  useEffect(() => {
    Promise.allSettled([api.get('/pacientes'), api.get('/profesionales')])
      .then(([p, pr]) => {
        if (p.status === 'fulfilled') setPacientes(p.value.data)
        if (pr.status === 'fulfilled') setProfesionales(pr.value.data)
      })
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

  return (
    <>
      <Header compact/>

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

      <h1>Nuevo Turno</h1>
      <div className='card d-flex p-5 m-5 justify-content-center align-items-center align-self-center border border-primary'>
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
    </>
  )
}
