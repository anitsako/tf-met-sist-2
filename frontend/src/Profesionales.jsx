import { useEffect, useState } from 'react'
import { api } from './api'
import { NavLink } from "react-router-dom";
import { Header } from "./Header";

export function Profesionales() {
  const [list, setList] = useState([])
  const [especialidades, setEsp] = useState([])
  const [form, setForm] = useState({ nombre:'', apellido:'', especialidad_id:'', matricula:'' })
  const [editingId, setEditingId] = useState(null)

  // --- Cargar datos ---
  const cargar = async () => {
    const [a, b] = await Promise.all([
      api.get('/profesionales'),
      api.get('/especialidades')
    ])
    setList(a.data)
    setEsp(b.data)
  }
  useEffect(() => { cargar() }, [])

  // --- Crear o editar ---
  const onSubmit = async (e) => {
    e.preventDefault()
    if (editingId)
      await api.put(`/profesionales/${editingId}`, form)
    else
      await api.post('/profesionales', form)

    setForm({ nombre:'', apellido:'', especialidad_id:'', matricula:'' })
    setEditingId(null)
    await cargar()
  }

  // --- Editar ---
  const onEdit = (p) => {
    setEditingId(p.id)
    setForm({
      nombre: p.nombre,
      apellido: p.apellido,
      especialidad_id: p.especialidad_id,
      matricula: p.matricula ?? ''
    })
  }

  // --- Eliminar ---
  const onDelete = async (id) => {
    if (confirm('¿Eliminar?')) {
      await api.delete(`/profesionales/${id}`)
      await cargar()
    }
  }

  // --- Cancelar edición ---
  const onCancel = () => {
    setEditingId(null)
    setForm({ nombre:'', apellido:'', especialidad_id:'', matricula:'' })
  }

  // --- Buscar nombre de especialidad ---
  const getEspecialidadNombre = (id) => {
    const e = especialidades.find(x => x.id === id)
    return e ? e.nombre : '—'
  }

  return (
    <>

      {/* NAV con NavLink */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <ul className="nav nav-tabs border-0">
            <li className="nav-item">
              <NavLink to="/dashboard" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
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
              <img src="/person-circle.svg" id="person-logo" alt="person logo" /> Dr. García
            </span>
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="container py-4">
        <h3 className="mb-3">{editingId ? 'Editar Profesional' : 'Profesionales'}</h3>

        <form className="row g-3 mb-4" onSubmit={onSubmit}>
          <div className="col-md-3">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              value={form.nombre}
              onChange={e=>setForm({...form, nombre:e.target.value})}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Apellido</label>
            <input
              className="form-control"
              value={form.apellido}
              onChange={e=>setForm({...form, apellido:e.target.value})}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Especialidad</label>
            <select
              className="form-select"
              value={form.especialidad_id}
              onChange={e=>setForm({...form, especialidad_id:e.target.value})}
              required
            >
              <option value="">Seleccione…</option>
              {especialidades.map(e =>
                <option key={e.id} value={e.id}>{e.nombre}</option>
              )}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Matrícula</label>
            <input
              className="form-control"
              value={form.matricula}
              onChange={e=>setForm({...form, matricula:e.target.value})}
            />
          </div>

          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary" type="submit">
              {editingId ? 'Guardar cambios' : 'Agregar'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Especialidad</th>
                    <th>Matrícula</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(p=>(
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.nombre}</td>
                      <td>{p.apellido}</td>
                      <td>{getEspecialidadNombre(p.especialidad_id)}</td>
                      <td>{p.matricula ?? ''}</td>
                      <td className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={()=>onEdit(p)}>Editar</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={()=>onDelete(p.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {list.length===0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">Sin profesionales</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
