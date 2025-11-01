from typing import List
from fastapi import APIRouter, HTTPException
from schemas.especialidad import Especialidad, EspecialidadAdd
from config.database import db

router = APIRouter()

@router.get('/', response_model=List[Especialidad])
async def traer_especialidades():
    rows = await db.fetch_all("SELECT * FROM especialidades")
    return rows

# OJO: el nombre del parámetro debe coincidir con el del path
@router.get('/{especialidad_id}', response_model=Especialidad)
async def traer_una_especialidad(especialidad_id: int):
    row = await db.fetch_one(
        "SELECT * FROM especialidades WHERE id = :id",
        {"id": especialidad_id}
    )
    if not row:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")
    return row

@router.post('/', response_model=Especialidad)
async def crear_especialidad(especialidad: EspecialidadAdd):
    query = """
        INSERT INTO especialidades (nombre, descripcion)
        VALUES (:nombre, :descripcion)
    """
    last_id = await db.execute(query, especialidad.dict())
    return {**especialidad.dict(), "id": last_id}

@router.put('/{especialidad_id}', response_model=Especialidad)
async def modificar_especialidad(especialidad_id: int, especialidad: EspecialidadAdd):
    existing = await db.fetch_one("SELECT * FROM especialidades WHERE id = :id", {"id": especialidad_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")

    query = """
        UPDATE especialidades
        SET nombre = :nombre,
            descripcion = :descripcion
        WHERE id = :id
    """
    await db.execute(query, {**especialidad.dict(), "id": especialidad_id})
    return {**especialidad.dict(), "id": especialidad_id}

# Devolvé un dict (o poné response_model=None)
@router.delete('/{especialidad_id}')
async def eliminar_especialidad(especialidad_id: int):
    existing = await db.fetch_one("SELECT * FROM especialidades WHERE id = :id", {"id": especialidad_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")

    await db.execute("DELETE FROM especialidades WHERE id = :id", {"id": especialidad_id})
    return {"message": f"Especialidad {especialidad_id} eliminada"}
