from pydantic import BaseModel

class ProfesionalIn(BaseModel):
    nombre: str
    apellido: str
    especialidad_id: int
    matricula: str | None = None

class Profesional(BaseModel):
    id: int
    nombre: str
    apellido: str
    especialidad_id: int
    matricula: str | None = None
