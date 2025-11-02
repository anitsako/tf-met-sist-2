import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { Login } from "./Login";
import { Dashboard } from "./Dashboard";
import { Header } from "./Header";
import { Pacientes } from "./Pacientes";
import { Especialidades } from "./Especialidades";
import { Profesionales } from "./Profesionales";  // ✅ componente real
import { TurnoForm } from "./TurnoForm";
import { Calendario } from "./Calendario";

function Reportes() { return <div className="container py-4"><h3>Reportes</h3></div>; }

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><Header /><Login /></>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nueva-cita" element={<TurnoForm />} />
        <Route path="/pacientes" element={<><Header compact /><Pacientes /></>} />
        <Route path="/especialidades" element={<><Header compact /><Especialidades /></>} />
        <Route path="/profesionales" element={<><Header compact /><Profesionales /></>} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/reportes" element={<><Header compact /><Reportes /></>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
