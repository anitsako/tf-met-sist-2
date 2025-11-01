import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";
import { Header } from "./Header";
import { api } from "./api";

export function Dashboard() {
  const [fecha, setFecha] = useState(new Date());
  const [lista, setLista] = useState([])

  useEffect(() => {
      const cargar = async () => {
      try {
        const response = await api.get("/turnos")
        setLista(response.data)
        console.log(response.data)
      } catch(e) {
        console.error("error al cargar los turnos", e)
      }
  }
    cargar()
  }, [])


  const citasPendientes = [
    { paciente: "Juan Perez", hora: "10:00 AM - 11:30" },
    { paciente: "Ana Rodriguez", doctor: "Dra. Lopez" },
  ];

  

  const citas = []; 

  return (
    <>
      <Header compact />

      <div className="dashboard-container">
        {/* NAV con NavLink */}
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
                <img src="/person-circle.svg" id="person-logo" alt="person logo" /> Dr. García
              </span>
            </div>
          </div>
        </nav>

        {/* Contenido principal */}
        <div className="container-fluid">
          <div className="row">
            {/* Izquierda */}
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
                    {citasPendientes.map((cita, i) => (
                      <li key={i} className="list-group-item">
                        <strong>Paciente:</strong> {cita.paciente}
                        {cita.hora && (
                          <>
                            <br />
                            <small>{cita.hora}</small>
                          </>
                        )}
                        {cita.doctor && (
                          <>
                            <br />
                            <small>{cita.doctor}</small>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Derecha */}
            <div className="col-md-8">
              <div className="card h-50">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Gestión de Citas</h5>
                    <NavLink to={'/nueva-cita'} className="btn btn-primary">
                      + Nueva Cita
                    </NavLink>
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
                        {lista.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center text-muted">
                              Sin datos
                            </td>
                          </tr>
                        ) : (
                          lista.map((cita, idx) => (
                            <tr key={idx}>
                              <td>{cita.fecha}</td>
                              <td>{cita.hora}</td>
                              <td>{cita.paciente}</td>
                              <td>{cita.profesional}</td>
                              <td>{cita.especialidad}</td>
                              <td>{cita.estado}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {/* /Derecha */}
          </div>
        </div>
      </div>
    </>
  );
}
