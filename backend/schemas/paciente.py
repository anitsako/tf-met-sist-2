from pydantic import BaseModel


class PacienteIn(BaseModel):
    dni: int
    nombre: str
    apellido: str
    direccion: str | None = None
    telefono: str | None = None

class Paciente(BaseModel):
    id: int
    dni: int
    nombre: str
    apellido: str
    direccion: str | None = None
    telefono: str | None = None