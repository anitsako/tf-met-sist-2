from pydantic import BaseModel

class EspecialidadAdd(BaseModel):
    nombre: str
    descripcion: str

class EspecialidadUpdate(BaseModel):
    descripcion: str

class Especialidad(BaseModel):
    id: int
    nombre: str
    descripcion: str
