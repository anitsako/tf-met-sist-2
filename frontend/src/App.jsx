import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthPage } from "./AuthContext";
import "./App.css";
import { Login } from "./Login";
import { Dashboard } from "./Dashboard";
import { Header } from "./Header";
import { Pacientes } from "./Pacientes";
import { Especialidades } from "./Especialidades";
import { Profesionales } from "./Profesionales";
import { TurnoForm } from "./TurnoForm";
import { Calendario } from "./Calendario";
import { Reportes } from "./Reportes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<><Header /><Login /></>} />
          <Route path="/dashboard" element={ <AuthPage> <Dashboard /> </AuthPage>} />  
          <Route path="/nueva-cita" element={<TurnoForm />} />
          <Route path="/pacientes" element={<><Header compact /><Pacientes /></>} />
          <Route path="/especialidades" element={<><Header compact /><Especialidades /></>} />
          <Route path="/profesionales" element={<><Header compact /><Profesionales /></>} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
