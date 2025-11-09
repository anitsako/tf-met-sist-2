import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";
import { Header } from "./Header";
import { api } from "./api";
import { useAuth } from './AuthContext'


export function Dashboard() {
  const { user, logout } = useAuth()
  const [fecha, setFecha] = useState(new Date());
  const [lista, setLista] = useState([])
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      const cargarTurnos = async () => {
        setLoading(true);
      try {
        const response = await api.get("/turnos/")
        setLista(response.data)
      } catch(e) {
        console.error("error al cargar los turnos:", e);
      } finally {
        setLoading(false);
      }
  };
    cargarTurnos();
  }, []);

// Cargar citas pendientes desde la API
  
useEffect(() => {
  const  cargarPendientes = async () => {
    try {
      const response = await api.get("/turnos/pendientes/hoy/");
      setCitasPendientes(response.data);
    } catch (e) {
      console.error("Error al cargar citas pendientes:", e);
    }
  };
  cargarPendientes();
}, []);

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
                {user && ( <button className="nav-tabs btn btn-secondary"  onClick={logout}>Cerrar sesión</button> )}
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
                  {citasPendientes.length === 0 ? (
                    <p className="text-muted text-center">No hay citas pendientes</p>
                  ) : (
                  <ul className="list-group list-group-flush">
                    {citasPendientes.map((cita) => (
                      <li key={cita.id} className="list-group-item">
                        <strong>Paciente:</strong> {cita.paciente}
                        <br />
                        <small className="text-muted">{cita.fecha} a las {cita.hora}</small> 
                        <br /> 
                        <small className="text-muted">{cita.profesional} - {cita.especialidad}</small> 
                        <br />
                        <span className={`badge ${
                            cita.estado === 'Confirmado' ? 'bg-success' : 'bg-warning'
                          } mt-1`}>
                            {cita.estado}
                          </span>
                          </li>
                    ))}
                    </ul>
                  )}
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
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="text-center">
                            Cargando...
                          </td>
                        </tr>
                      ) : lista.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center text-muted">
                              Sin datos
                            </td>
                          </tr>
                        ) : (
                          lista.map((cita) => (
                            <tr key={cita.id}>
                              <td>{cita.fecha}</td>
                              <td>{cita.hora}</td>
                              <td>{cita.paciente}</td>
                              <td>{cita.profesional}</td>
                              <td>{cita.especialidad}</td>
                              <td>
                                <span className={`badge ${
                                  cita.estado === 'Confirmado' ? 'bg-success' :
                                  cita.estado === 'Pendiente' ? 'bg-warning' :
                                  cita.estado === 'Reprogramado' ? 'bg-info' :
                                  'bg-secondary'
                                }`}>
                                  {cita.estado}
                                  </span>
                                </td>
                            </tr>
                          ))
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
    </>
  );
}
