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
import { RegistrarUsuario } from './RegistrarUsuario'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<><Header compact /><Login /></>} end />
          <Route path="/registrarse" element={<> <Header compact /> <RegistrarUsuario /> </>} />

          <Route path="/dashboard" element={ <AuthPage> <Dashboard /> </AuthPage>} />  
          <Route path="/nueva-cita" element={<> <Header compact /> <AuthPage> <TurnoForm /> </AuthPage> </>} />
          <Route path="/pacientes" element={<><Header compact /> <AuthPage> <Pacientes /> </AuthPage> </>} />
          <Route path="/especialidades" element={<><Header compact /> <AuthPage> <Especialidades /> </AuthPage> </>} />
          <Route path="/profesionales" element={<><Header compact /> <AuthPage> <Profesionales /> </AuthPage> </>} />
          <Route path="/calendario" element={<> <Header compact /> <AuthPage> <Calendario /> </AuthPage> </>} />
          <Route path="/reportes" element={<> <Header compact /> <AuthPage> <Reportes /> </AuthPage> </>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
