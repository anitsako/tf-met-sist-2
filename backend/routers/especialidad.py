from typing import List
from fastapi import APIRouter, HTTPException
from schemas.especialidad import Especialidad ,EspecialidadAdd, EspecialidadUpdate
from config.database import db


router = APIRouter()

@router.get('/', response_model=List[Especialidad])
async def traer_especialidades():
    query = "SELECT * FROM especialidades"
    rows = await db.fetch_all(query=query)
    return rows


@router.get('/{id}', response_model=[Especialidad])
async def traer_una_especialidad(especialidad_id: int):
    query = "SELECT * FROM especialidades WHERE id = :id"
    row = await db.fetch_one(query=query, values={"id":especialidad_id})
    if not row:
        raise HTTPException(status_code=404, detail="especialidad no encontrada")

    return row    

@router.post('/', response_model=[Especialidad])
async def crear_especialidad(especialidad: EspecialidadAdd):
    query = """
        INSERT INTO especialidades (nombre, descripcion)
        VALUES (:nombre, :descripcion)
    """
    last_record_id = await db.execute(query=query, values=especialidad.dict())
    return {**especialidad.dict(), "id": last_record_id}


@router.put('/{id}', response_model=[Especialidad])
async def modificar_especialidad(especialidad_id: int, especialidad: EspecialidadAdd):

    check_query = "SELECT * FROM especialidades WHERE id = :id"
    existing = await db.fetch_one(check_query, {'id': especialidad_id})
    if not existing:
        raise HTTPException(status_code=404, detail='Especialidad no encontrada')


    query = """
            UPDATE especialidades SET 
            nombre = :nombre,
            descripcion = :descripcion
            WHERE id = :id
    """
    values = {**especialidad.dict(), "id": especialidad_id}
    await db.execute(query=query, values=values)
    return {**especialidad.dict(), "id" :especialidad_id}

@router.delete('/{id}', response_model=[Especialidad])
async def eliminar_especialidad(especialidad_id: int):
    check_query = "SELECT * FROM especialidades WHERE id = :id"
    existing = await db.fetch_one(check_query, {"id": especialidad_id})
    if not existing:
        raise HTTPException(status_code=404, detail='especialidad no encontrada')
    
    query = "DELETE FROM especialidades WHERE id = :id"
    await db.execute(query=query, values={"id": especialidad_id})

    return{'Message': f"especialidad con ID {especialidad_id} eliminada correctamente"}

