import { useEffect, useState } from 'react'
import { api } from './api'
import { NavLink } from 'react-router-dom'
import { Header } from './Header'

export function Pacientes() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ dni:'', nombre:'', apellido:'', direccion:'', telefono:'' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // --- Cargar lista ---
  const cargar = async () => {
    setLoading(true)
    try {
      const r = await api.get('/pacientes')
      setList(r.data)
    } catch (e) {
      setError('No se pudieron cargar pacientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  // --- Crear o editar ---
  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await api.put(`/pacientes/${editingId}`, form)
      } else {
        await api.post('/pacientes', form)
      }
      setForm({ dni:'', nombre:'', apellido:'', direccion:'', telefono:'' })
      setEditingId(null)
      await cargar()
    } catch (e) {
      setError('Error guardando el paciente. Verifique DNI único y campos obligatorios.')
    }
  }

  // --- Editar paciente ---
  const onEdit = (p) => {
    setEditingId(p.id)
    setForm({
      dni: p.dni, nombre: p.nombre, apellido: p.apellido,
      direccion: p.direccion ?? '', telefono: p.telefono ?? ''
    })
  }

  // --- Eliminar paciente ---
  const onDelete = async (id) => {
    if (!confirm('¿Eliminar paciente?')) return
    await api.delete(`/pacientes/${id}`)
    await cargar()
  }

  // --- Cancelar edición ---
  const onCancel = () => {
    setEditingId(null)
    setForm({ dni:'', nombre:'', apellido:'', direccion:'', telefono:'' })
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

      {/* CONTENIDO PRINCIPAL */}
      <div className="container py-4">
        <h3 className="mb-3">{editingId ? 'Editar Paciente' : 'Pacientes'}</h3>

        <form className="row g-3 mb-4" onSubmit={onSubmit}>
          <div className="col-md-2">
            <label className="form-label">DNI</label>
            <input
              type="number"
              className="form-control"
              value={form.dni}
              onChange={e => setForm({ ...form, dni: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Apellido</label>
            <input
              className="form-control"
              value={form.apellido}
              onChange={e => setForm({ ...form, apellido: e.target.value })}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Dirección</label>
            <input
              className="form-control"
              value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Teléfono</label>
            <input
              className="form-control"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
            />
          </div>
          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {editingId ? 'Guardar cambios' : 'Agregar'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancelar
              </button>
            )}
          </div>
          {error && <div className="text-danger">{error}</div>}
        </form>

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
                      <th>DNI</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Dirección</th>
                      <th>Teléfono</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.dni}</td>
                        <td>{p.nombre}</td>
                        <td>{p.apellido}</td>
                        <td>{p.direccion ?? ''}</td>
                        <td>{p.telefono ?? ''}</td>
                        <td className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => onEdit(p)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onDelete(p.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {list.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">
                          Sin pacientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
