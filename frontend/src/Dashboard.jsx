import { Header } from './Header'
import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './Dashboard.css'

export function Dashboard() {
    const [fecha, setFecha] = useState(new Date())

    //Datos de ejemplo, pueden ser reemplazados 
    const citas = [
        { hora: '09:00 AM', paciente: 'Carlos Ruiz', medico: 'Consulta General', servicio: 'Confirmado' },
        { hora: '09:30 AM', paciente: 'Dr. Fernandez', medico: 'Cardiología', servicio: 'Confirmado' },   
        { hora: '10:00 AM', paciente: 'Dr. Perez', medico: 'Dra Perez / Dermatología', servicio: 'Reprogramado' },
        { hora: '10:00 AM', paciente: 'Dr. García', medico: 'Pediatría', servicio: 'Pendiente' },
        { hora: '10:30 AM', paciente: 'Luisa Torres', medico: 'Dr. Raimrez / Odontología', servicio: 'Confirmado' }
    ]

    const citasPendientes = [
    { paciente: 'Juan Perez', hora: '10:00 AM - 11:30' },
    { paciente: 'Ana Rodriguez', doctor: 'Dra. Lopez' }
  ]

  return (
    <>
    {/* Cabecera de la clínica*/}
      <Header compact />
      
    <div className="dashboard-container">
      {/* Navegación */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <ul className="nav nav-tabs border-0">
            <li className="nav-item">
              <a className="nav-link active" href="#dashboard">Dashboard</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#pacientes">Pacientes</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#calendario">Calendario</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#especialidades">Especialidades</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#reportes">Reportes</a>
            </li>
          </ul>
          <div className="ms-auto d-flex align-items-center">
            <span className="me-3">👤 Dr. García</span>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="container-fluid">
        <div className="row">
          {/* Columna izquierda - Calendario y Citas Pendientes */}
          <div className="col-md-4">
            {/* Calendario con react-calendar */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Calendario</h5>
                <Calendar 
                  onChange={setFecha} 
                  value={fecha}
                  locale="es-ES"
                />
              </div>
            </div>

            {/* Citas Pendientes */}
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

          {/* Columna derecha - Gestión de Citas */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Gestión de Citas</h5>
                  <button className="btn btn-primary">+ Nueva Cita</button>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Paciente</th>
                        <th>Médico/Especialidad</th>
                        <th>Servicio</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citas.map((cita, index) => (
                        <tr key={index}>
                          <td>{cita.hora}</td>
                          <td>{cita.paciente}</td>
                          <td>{cita.medico}</td>
                          <td>
                            <span className={`badge ${
                              cita.servicio === 'Confirmado' ? 'bg-success' :
                              cita.servicio === 'Pendiente' ? 'bg-warning' :
                              'bg-info'
                            }`}>
                              {cita.servicio}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-secondary">⋮</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}