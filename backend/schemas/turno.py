from pydantic import BaseModel
from datetime import datetime


class TurnoAdd(BaseModel):
    id_medico: int
    id_paciente: int
    fecha: datetime
    estado: str | None = 'pendiente' #por defecto

class TurnoUpdate(BaseModel):
    estado: str

class Turno(BaseModel):
    id: int
    id_medico: int
    id_paciente: int
    fecha: datetime
    estado: str
