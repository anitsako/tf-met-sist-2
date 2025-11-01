// frontend/src/Especialidades.jsx
import { useEffect, useState } from 'react'
import { api } from './api'
import { NavLink } from "react-router-dom";
import { Header } from "./Header";

export function Especialidades() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ nombre:'', descripcion:'' })
  const [editingId, setEditingId] = useState(null)

  const cargar = async () => {
    const r = await api.get('/especialidades')
    setList(r.data)
  }
  useEffect(() => { cargar() }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (editingId) {
      await api.put(`/especialidades/${editingId}`, form)
    } else {
      await api.post('/especialidades', form)
    }
    setForm({ nombre:'', descripcion:'' })
    setEditingId(null)
    await cargar()
  }

  const onEdit = (it) => { setEditingId(it.id); setForm({ nombre: it.nombre, descripcion: it.descripcion ?? '' }) }
  const onDelete = async (id) => { if (confirm('¿Eliminar?')) { await api.delete(`/especialidades/${id}`); await cargar() } }
  const onCancel = () => { setEditingId(null); setForm({ nombre:'', descripcion:'' }) }

  return (
    <>

      {/* NAV con NavLink (igual al Dashboard) */}
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
        <h3 className="mb-3">{editingId ? 'Editar Especialidad' : 'Especialidades'}</h3>

        <form className="row g-3 mb-4" onSubmit={onSubmit}>
          <div className="col-md-4">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              value={form.nombre}
              onChange={e=>setForm({...form, nombre:e.target.value})}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Descripción</label>
            <input
              className="form-control"
              value={form.descripcion}
              onChange={e=>setForm({...form, descripcion:e.target.value})}
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
                <thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr></thead>
                <tbody>
                  {list.map(it=>(
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td>{it.nombre}</td>
                      <td>{it.descripcion ?? ''}</td>
                      <td className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={()=>onEdit(it)}>Editar</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={()=>onDelete(it.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {list.length===0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">Sin especialidades</td>
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
