from typing import List
from fastapi import APIRouter, HTTPException
from schemas.paciente import Paciente, PacienteIn
from config.database import db

router = APIRouter()

@router.get('/', response_model=List[Paciente])
async def traer_pacientes():
    return await db.fetch_all("SELECT * FROM pacientes")

@router.get('/{paciente_id}', response_model=Paciente)
async def traer_un_paciente(paciente_id: int):
    row = await db.fetch_one("SELECT * FROM pacientes WHERE id = :id", {"id": paciente_id})
    if not row:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return row

@router.post('/', response_model=Paciente)
async def crear_pacientes(paciente: PacienteIn):
    query = """
        INSERT INTO pacientes (dni, nombre, apellido, direccion, telefono)
        VALUES (:dni, :nombre, :apellido, :direccion, :telefono)
    """
    last_id = await db.execute(query, paciente.dict())
    return {**paciente.dict(), "id": last_id}

@router.put('/{paciente_id}', response_model=Paciente)
async def modificar_pacientes(paciente_id: int, paciente: PacienteIn):
    existing = await db.fetch_one("SELECT * FROM pacientes WHERE id = :id", {"id": paciente_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    query = """
        UPDATE pacientes SET
            dni = :dni,
            nombre = :nombre,
            apellido = :apellido,
            direccion = :direccion,
            telefono = :telefono
        WHERE id = :id
    """
    await db.execute(query, {**paciente.dict(), "id": paciente_id})
    return {**paciente.dict(), "id": paciente_id}

@router.delete('/{paciente_id}')
async def eliminar_pacientes(paciente_id: int):
    existing = await db.fetch_one("SELECT * FROM pacientes WHERE id = :id", {"id": paciente_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    await db.execute("DELETE FROM pacientes WHERE id = :id", {"id": paciente_id})
    return {"message": f"Paciente {paciente_id} eliminado"}
