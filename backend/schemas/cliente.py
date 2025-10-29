from pydantic import BaseModel


class ClienteIn(BaseModel):
    dni: int
    nombre: str
    apellido: str
    direccion: str | None = None
    telefono: str | None = None

class Cliente(BaseModel):
    id: int
    dni: int
    nombre: str
    apellido: str
    direccion: str | None = None
    telefono: str | None = None