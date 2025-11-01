import { Header } from './Header'
import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './Dashboard.css'
import { TurnoForm } from './TurnoForm.jsx'
import { api } from './api.js'


export function Dashboard() {
  const [fecha, setFecha] = useState(new Date())
  const [agenda, setAgenda] = useState([])  
  const [showModal, setShowModal] = useState(false)

  const cargarAgenda = async () => {
    try {
      const r = await api.get('/turnos/reporte/agenda') 
      setAgenda(r.data)
    } catch {
      setAgenda([])
    }
  }

  useEffect(() => { cargarAgenda() }, [])

  const citasPendientes = [
    { paciente: 'Juan Perez', hora: '10:00 AM - 11:30' },
    { paciente: 'Ana Rodriguez', doctor: 'Dra. Lopez' }
  ]

  return (
    <>
      <Header compact />

      <div className="dashboard-container">
        {/* Navegación */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
          <div className="container-fluid">
            <ul className="nav nav-tabs border-0">
              <li className="nav-item"><a className="nav-link active" href="#dashboard">Dashboard</a></li>
              <li className="nav-item"><a className="nav-link" href="#pacientes">Pacientes</a></li>
              <li className="nav-item"><a className="nav-link" href="#calendario">Calendario</a></li>
              <li className="nav-item"><a className="nav-link" href="#especialidades">Especialidades</a></li>
              <li className="nav-item"><a className="nav-link" href="#reportes">Reportes</a></li>
            </ul>
            <div className="ms-auto d-flex align-items-center">
              <span className="me-3"><img src="/person-circle.svg" id='person-logo' alt="person logo" /> Dr. García</span>
            </div>
          </div>
        </nav>

        {/* Contenido principal */}
        <div className="container-fluid">
          <div className="row">
            {/* Columna izquierda */}
            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Calendario</h5>
                  <Calendar onChange={setFecha} value={fecha} locale="es-ES" />
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Citas Pendientes</h5>
                <ul className="list-group list-group-flush">
                  {citasPendientes.map((cita, index) => (
                    <li key={index} className="list-group-item">
                      <strong>Paciente:</strong> {cita.paciente}
                      {cita.hora && <><br /><small>{cita.hora}</small></>}
                      {cita.doctor && <><br /><small>{cita.doctor}</small></>}
                    </li>
                  ))}
                </ul>
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="col-md-8">
              <div className="card h-50">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Gestión de Citas</h5>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nueva Cita</button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Paciente</th>
                          <th>Profesional</th>
                          <th>Especialidad</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agenda.map((cita) => (
                          <tr key={cita.id}>
                            <td>{new Date(cita.fecha).toLocaleDateString()}</td>
                            <td>{(cita.hora || '').slice(0,5)}</td>
                            <td>{cita.paciente}</td>
                            <td>{cita.profesional}</td>
                            <td>{cita.especialidad}</td>
                            <td>
                              <span className={`badge ${
                                cita.estado === 'confirmado' ? 'bg-success'
                                : cita.estado === 'pendiente' ? 'bg-warning'
                                : cita.estado === 'reprogramado' ? 'bg-info'
                                : 'bg-secondary'
                              }`}>
                                {cita.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {agenda.length === 0 && (
                          <tr><td colSpan="6" className="text-center text-muted">Sin datos</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal controlado */}
{showModal && (
  <>
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Nueva Cita</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowModal(false)}
            />
          </div>
          <div className="modal-body">
            <TurnoForm
              onCreated={async () => {
                await cargarAgenda()
                setShowModal(false)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </>
)}

    </>
  )
}
