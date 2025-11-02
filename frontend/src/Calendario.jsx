import { useState, useEffect } from "react";
import { data, NavLink, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendario.css";
import { api } from "./api";
import { Header } from "./Header";

export function Calendario() {
    const navigate = useNavigate();
    const [fecha, setFecha] = useState(new Date());
    const [todosTurnos, setTodosTurnos] = useState([]);
    const [turnosDia, setTurnosDia] = useState([]);
    const [profesionales, setProfesionales] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [filtroProfesional, setFiltroProfecional] = useState("");
    const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
    const [loading, setLoading] = useState(false);


// Carga de turnos y catalogos
useEffect(() => {
    cargarDatos();
   }, []);

   const cargarDatos = async () => {
    setLoading(true);
    try {
        const [resTurnos, resProf, resEsp] = await Promise.all([
            api.get("/turnos"),
            api.get("/profesionales"),
            api.get("/especialidades"),
        ]);
        setTodosTurnos(resTurnos.data);
        setProfesionales(resProf.data);
        setEspecialidades(resEsp.data);
    } catch (e) {
        console.error("Error al cargar datos:", e);
    } finally {
        setLoading(false);
    }
};

 // Fltrado de turnos cuando cambia la fecha o filtros
 useEffect(() => {
    filtrarTurnos();
 }, [fecha, todosTurnos, filtroProfesional, filtroEspecialidad]);

 const filtrarTurnos = () => {
    const fechaStr = fecha.toISOString().split("T")[0];
 let filtrados = todosTurnos.filter((t) => t.fecha === fechaStr);

 // Aplicar filtro de profesional
 if (filtroProfesional) {
    filtrados = filtrados.filter((t) => t.profesional === filtroProfesional);

 }

 // Aplicar filtro de especialidad
 if (filtroEspecialidad) {
    filtrados = filtrados.filter((t) => t.especialidad === filtroEspecialidad);

 }

 setTurnosDia(filtrados);
 };

 // Verificar si un dia tiene turnos para marcarlo en el calendario
 const tieneTurnos = (date) => {
    const fechaStr = date.toISOString().split("T")[0];
    return todosTurnos.some((t) => t.fecha === fechaStr);
 };

 // Cambiar estado de turno
 const cambiarEstado = async (turnoId, nuevoEstado) => {
    try {
        await api.put(`/turnos/${turnoId}/estado`, { estado: nuevoEstado });
        await cargarDatos(); //Recargar datos
        alert("Estado actualizado correctamente");
    } catch (e) {
        console.error("Error al cambiar estado:", e);
        alert("Error al cambiar el estado");
    }
 };

 // Obtener badge de estado
 const getBadgeClass = (estado) => {
    switch (estado) {
        case "Confirmado":
            return "bd-success";
        case "Pendiente":
            return "bg-warning";
        case "Cancelado":
            return "bg-danger";
        case "Reprogramado":
            return "bg-info";
        default:
            return "bg-secondary";
    }
 };

 //Navegar a crear turno con fecha pre-seleccionada
 const nuevoTurnoFecha = () => {
    navigate("/nueva-cita", { state: { fecha: fecha.toISOString().split("T")[0] } });
 };

 return (
    <>
    <Header compact />
    <div className="calendario-container">
      {/* NAV */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <ul className="nav nav-tabs border-0">
            <li className="nav-item">
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
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

      {/* Contenido */}
      <div className="container-fluid py-4">
        <h3 className="mb-4">Calendario de Turnos</h3>

        <div className="row">
          {/* Calendario */}
          <div className="col-lg-5">
            <div className="card">
              <div className="card-body">
                <Calendar
                  onChange={setFecha}
                  value={fecha}
                  locale="es-ES"
                  tileClassName={({ date }) => (tieneTurnos(date) ? "tiene-turnos" : null)}
                />
              </div>
            </div>
          </div>

          {/* Panel de turnos del día */}
          <div className="col-lg-7">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  Turnos del {fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </h5>

                {/* Filtros */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Profesional</label>
                    <select className="form-select" value={filtroProfesional} onChange={(e) => setFiltroProfesional(e.target.value)}>
                      <option value="">Todos</option>
                      {profesionales.map((p) => (
                        <option key={p.id} value={`${p.nombre} ${p.apellido}`}>
                          {p.nombre} {p.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Especialidad</label>
                    <select className="form-select" value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)}>
                      <option value="">Todas</option>
                      {especialidades.map((e) => (
                        <option key={e.id} value={e.nombre}>
                          {e.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contador */}
                <p className="text-muted mb-3"> {turnosDia.length} turno(s) encontrado(s)</p>

                {/* Lista de turnos */}
                {loading ? (
                  <p className="text-center">Cargando...</p>
                ) : turnosDia.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted"> No hay turnos para este día</p>
                    <button className="btn btn-primary mt-2" onClick={nuevoTurnoFecha}>
                      + Agendar Turno
                    </button>
                  </div>
                ) : (
                  <div className="turnos-lista">
                    {turnosDia.map((turno) => (
                      <div key={turno.id} className="card mb-2 turno-card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">
                                <strong>{turno.hora}</strong> - {turno.paciente}
                              </h6>
                              <p className="mb-1 text-muted small">
                                {turno.profesional} - {turno.especialidad}
                              </p>
                              <span className={`badge ${getBadgeClass(turno.estado)}`}>{turno.estado}</span>
                            </div>
                            <div className="dropdown">
                              <button
                                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                              >
                                Acciones
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <button className="dropdown-item" onClick={() => cambiarEstado(turno.id, "Confirmado")}>
                                     Confirmar
                                  </button>
                                </li>
                                <li>
                                  <button className="dropdown-item" onClick={() => cambiarEstado(turno.id, "Cancelado")}>
                                     Cancelar
                                  </button>
                                </li>
                                <li>
                                  <button className="dropdown-item" onClick={() => cambiarEstado(turno.id, "Reprogramado")}>
                                     Reprogramar
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón nuevo turno */}
                {turnosDia.length > 0 && (
                  <button className="btn btn-primary w-100 mt-3" onClick={nuevoTurnoFecha}>
                    + Nuevo Turno para este día
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}