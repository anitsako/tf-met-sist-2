from pydantic import BaseModel

class EspecialidadAdd(BaseModel):
    nombre: str
    descripcion: str | None = None

class EspecialidadUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None

class Especialidad(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None
