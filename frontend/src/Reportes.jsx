import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { api } from "./api";
import { Header } from "./Header";

import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";

export function Reportes() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [agenda, setAgenda] = useState([]); // /turnos/pendientes/hoy
  const [topProfes, setTopProfes] = useState([]); // /turnos/reporte/top-profesionales
  const [porEspEstado, setPorEspEstado] = useState([]); // /turnos/reporte/estadistica-especialidad

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const [a, b, c] = await Promise.all([
          api.get("/turnos/pendientes/hoy"),
          api.get("/turnos/reporte/top-profesionales?limit=5"),
          api.get("/turnos/reporte/estadistica-especialidad"),
        ]);
        setAgenda(a.data || []);
        setTopProfes(b.data || []);
        setPorEspEstado(c.data || []);
      } catch (e) {
        setErr("No se pudieron cargar los reportes.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Barras: cantidad por especialidad (sumando todos los estados)
  const barrasPorEspecialidad = useMemo(() => {
    const map = new Map();
    for (const r of porEspEstado) {
      const key = r.especialidad;
      const prev = map.get(key) ?? 0;
      map.set(key, prev + Number(r.cantidad || 0));
    }
    return Array.from(map.entries()).map(([especialidad, total]) => ({ especialidad, total }));
  }, [porEspEstado]);

  // Torta: distribución global por estado (sumando todas las especialidades)
  const tortaPorEstado = useMemo(() => {
    const map = new Map();
    for (const r of porEspEstado) {
      const key = (r.estado || "").toLowerCase();
      const prev = map.get(key) ?? 0;
      map.set(key, prev + Number(r.cantidad || 0));
    }
    return Array.from(map.entries()).map(([estado, total]) => ({ name: estado, value: total }));
  }, [porEspEstado]);

  // KPI simples
  const kpis = useMemo(() => {
    const totalTurnos = barrasPorEspecialidad.reduce((acc, it) => acc + it.total, 0);
    const pendientes = tortaPorEstado.find((x) => x.name === "pendiente")?.value ?? 0;
    const confirmados = tortaPorEstado.find((x) => x.name === "confirmado")?.value ?? 0;
    const reprogramados = tortaPorEstado.find((x) => x.name === "reprogramado")?.value ?? 0;
    const cancelados = tortaPorEstado.find((x) => x.name === "cancelado")?.value ?? 0;
    return { totalTurnos, pendientes, confirmados, reprogramados, cancelados };
  }, [barrasPorEspecialidad, tortaPorEstado]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]; // colores por estado

  return (
    <>
    <Header compact />

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

      <div className="container py-3">
        <h3 className="mb-3">Reportes</h3>

        {err && <div className="alert alert-danger">{err}</div>}
        {loading && <div>Cargando…</div>}

        {!loading && (
          <>
            {/* KPIs */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body">
                    <div className="text-muted">Total turnos</div>
                    <div className="h4 m-0">{kpis.totalTurnos}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card">
                  <div className="card-body">
                    <div className="text-muted">Pendientes</div>
                    <div className="h4 m-0">{kpis.pendientes}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card">
                  <div className="card-body">
                    <div className="text-muted">Confirmados</div>
                    <div className="h4 m-0">{kpis.confirmados}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card">
                  <div className="card-body">
                    <div className="text-muted">Reprogramados</div>
                    <div className="h4 m-0">{kpis.reprogramados}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body">
                    <div className="text-muted">Cancelados</div>
                    <div className="h4 m-0">{kpis.cancelados}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agenda próxima + Top profesionales */}
            <div className="row g-3 mb-4">
              {/* Agenda (lista) */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Próximos turnos (pend/confirm)</h5>
                    {agenda.length === 0 ? (
                      <div className="text-muted">Sin turnos próximos</div>
                    ) : (
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
                            {agenda.map((t) => (
                              <tr key={t.id}>
                                <td>{t.fecha}</td>
                                <td>{t.hora}</td>
                                <td>{t.paciente}</td>
                                <td>{t.profesional}</td>
                                <td>{t.especialidad}</td>
                                <td>
                                  <span className={`badge ${
                                    t.estado === "confirmado" ? "bg-success" :
                                    t.estado === "pendiente" ? "bg-warning" :
                                    t.estado === "reprogramado" ? "bg-info" : "bg-secondary"
                                  }`}>
                                    {t.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top profesionales */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Top profesionales</h5>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Profesional</th>
                            <th>Total de turnos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProfes.length === 0 ? (
                            <tr>
                              <td colSpan="2" className="text-muted text-center">Sin datos</td>
                            </tr>
                          ) : topProfes.map((p, i) => (
                            <tr key={i}>
                              <td>{p.profesional}</td>
                              <td>{p.total_turnos}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="row g-3">
              {/* Barras: total por especialidad */}
              <div className="col-md-7">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Turnos por especialidad</h5>
                    {barrasPorEspecialidad.length === 0 ? (
                      <div className="text-muted">Sin datos</div>
                    ) : (
                      <div style={{ width: "100%", height: 320 }}>
                        <ResponsiveContainer>
                          <BarChart data={barrasPorEspecialidad} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="especialidad" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total" name="Total" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Torta: distribución por estado */}
              <div className="col-md-5">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Distribución por estado</h5>
                    {tortaPorEstado.length === 0 ? (
                      <div className="text-muted">Sin datos</div>
                    ) : (
                      <div style={{ width: "100%", height: 320 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={tortaPorEstado}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={110}
                              label
                            >
                              {tortaPorEstado.map((_, idx) => (
                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
