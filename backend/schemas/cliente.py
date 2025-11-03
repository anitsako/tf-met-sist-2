from pydantic import BaseModel


class ClienteIn(BaseModel):
    dni: int
    nombre: str
    apellido: str
    direccion: str | None = None
    telefono: str | None = None
    contraseña: str

class Cliente(BaseModel):
    id: int
    dni: int
    nombre: str
    apellido: str
    direccion: str | None = None
    telefono: str | None = None


class ClienteLogin(BaseModel):
    direccion: str
    contraseña: str