import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { api } from "./api";
import { Header } from "./Header";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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


  //Funcion para exportar a PDF 
  const exportarPDF = () => {
    const doc = new jsPDF();
    const fechaHoy = new Date().toLocaleDateString('es-AR');

    //Titulo
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');

    doc.setTextColor(0, 0, 0);
    doc.text('CLINICA', 14, 20);

    doc.setTextColor(7, 128, 223);
    doc.text('SALUD', 55, 20);
    
    // Subtítulo
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('Reporte de Turnos', 14, 30);
  
  // Fecha
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${fechaHoy}`, 14, 36);
  
  // Línea separadora
    doc.setDrawColor(7, 128, 223);
    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);
    
    let yPos = 45;

    // Seccion 1: KPis
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen General', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.text(`• Total de turnos: ${kpis.totalTurnos}`, 20, yPos);
    yPos += 6;
    doc.text(`• Confirmados: ${kpis.confirmados}`, 20, yPos);
    yPos += 6;
    doc.text(`• Pendientes: ${kpis.pendientes}`, 20, yPos);
    yPos += 6;
    doc.text(`• Reprogramados: ${kpis.reprogramados}`, 20, yPos);
    yPos += 6;
    doc.text(`• Cancelados: ${kpis.cancelados}`, 20, yPos);
    yPos += 12;

    //Seccion 2: proximos turnos
   doc.setFontSize(14);
    doc.text('Próximos Turnos (Pendientes/Confirmados)', 14, yPos);
    yPos += 5;
    
    if (agenda.length > 0) {
      const agendaRows = agenda.map(t => [
        t.fecha,
        t.hora,
        t.paciente,
        t.profesional,
        t.especialidad,
        t.estado
      ]);
      
      autoTable(doc, {
  head: [['Fecha', 'Hora', 'Paciente', 'Profesional', 'Especialidad', 'Estado']],
  body: agendaRows,
  startY: yPos,
  headStyles: { fillColor: [7, 128, 223], textColor: [255, 255, 255], fontStyle: 'bold' },
  styles: { fontSize: 9, cellPadding: 3 },
  columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 20 }, 5: { halign: 'center' } }
});
      
      yPos = doc.lastAutoTable.finalY + 12;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('No hay turnos próximos', 14, yPos + 5);
      yPos += 15;
    } 

    // Seccion 3: Top profecionales
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Profesionales', 14, yPos);
    yPos += 5;
    
    if (topProfes.length > 0) {
      const topRows = topProfes.map(p => [
        p.profesional,
        p.total_turnos
      ]);
      
      autoTable(doc, {
  head: [['Profesional', 'Total de Turnos']],
  body: topRows,
  startY: yPos,
  headStyles: { fillColor: [7, 128, 223], textColor: [255, 255, 255], fontStyle: 'bold' },
  styles: { fontSize: 10, cellPadding: 4 },
  columnStyles: { 0: { cellWidth: 120 }, 1: { halign: 'center', cellWidth: 60 } }
});
      
      yPos = doc.lastAutoTable.finalY + 12;
    }

    // Seccion 4: Turnos por especialidad
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Turnos por Especialidad', 14, yPos);
    yPos += 5;
    
    if (barrasPorEspecialidad.length > 0) {
      const espRows = barrasPorEspecialidad.map(e => [
        e.especialidad,
        e.total
      ]);
      
      autoTable(doc, {
  head: [['Especialidad', 'Total']],
  body: espRows,
  startY: yPos,
  headStyles: { fillColor: [7, 128, 223], textColor: [255, 255, 255], fontStyle: 'bold' },
  styles: { fontSize: 10, cellPadding: 4 },
  columnStyles: { 1: { halign: 'center' } }
});
    }

    //Pie de pagina
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    //Descargar 
    doc.save(`reporte-turnos-${new Date().toISOString().split('T')[0]}.pdf`);
  };

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]; // colores por estado


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
          </div>
        </div>
      </nav>

      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Reportes</h3>
          <button 
            className="btn btn-danger" 
            onClick={exportarPDF}
            disabled={loading}
          >
             Exportar a PDF
          </button>
        </div>

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
