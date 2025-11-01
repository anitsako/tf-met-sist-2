from pydantic import BaseModel, field_validator
from datetime import date, time
from typing import Optional

class TurnoIn(BaseModel):
    paciente_id: int
    profesional_id: int
    fecha: date
    hora: time

    @field_validator("fecha")
    @classmethod
    def validar_fecha_no_pasada(cls, v):
        from datetime import date as d
        if v < d.today():
            raise ValueError("La fecha no puede ser pasada")
        return v

class Turno(BaseModel):
    id: int
    paciente_id: int
    profesional_id: int
    fecha: date
    hora: time
    estado: str

class TurnoEstadoUpdate(BaseModel):
    estado: str  # pendiente | confirmado | cancelado | reprogramado | atendido
