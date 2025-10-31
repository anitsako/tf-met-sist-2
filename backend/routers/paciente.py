from typing import List
from fastapi import APIRouter, HTTPException
from schemas.paciente import Paciente ,PacienteIn
from config.database import db


router = APIRouter()

@router.get('/', response_model=List[Paciente])
async def traer_pacientes():
    query = "SELECT * FROM pacientes"
    rows = await db.fetch_all(query=query)
    return rows


@router.get('/{id}', response_model=[Paciente])
async def traer_un_paciente(paciente_id: int):
    query = "SELECT * FROM pacientes WHERE id = :id"
    row = await db.fetch_one(query=query, values={"id":paciente_id})
    if not row:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    return row    

@router.post('/', response_model=[Paciente])
async def crear_pacientes(paciente: PacienteIn):
    query = """
        INSERT INTO pacientes (dni, nombre, apellido, direccion, telefono)
        VALUES (:dni, :nombre, :apellido, :direccion, :telefono)
    """
    last_record_id = await db.execute(query=query, values=paciente.dict())
    return {**paciente.dict(), "id": last_record_id}


@router.put('/{id}', response_model=[Paciente])
async def modificar_pacientes(paciente_id: int, paciente: PacienteIn):

    check_query = "SELECT * FROM pacientes WHERE id = :id"
    existing = await db.fetch_one(check_query, {'id': paciente_id})
    if not existing:
        raise HTTPException(status_code=404, detail='Paciente no encontrado')


    query = """
            UPDATE pacientes SET 
            dni = :dni,
            nombre = :nombre,
            apellido = :apellido,
            direccion = :direccion,
            telefono = :telefono,
            WHERE id = :id
    """
    values = {**paciente.dict(), "id": paciente_id}
    await db.execute(query=query, values=values)
    return {**paciente.dict(), "id" :paciente_id}

@router.delete('/{id}', response_model=[Paciente])
async def eliminar_pacientes(paciente_id: int):
    check_query = "SELECT * FROM pacientes WHERE id = :id"
    existing = await db.fetch_one(check_query, {"id": paciente_id})
    if not existing:
        raise HTTPException(status_code=404, detail='paciente no encontrado')
    
    query = "DELETE FROM pacientes WHERE id = :id"
    await db.execute(query=query, values={"id": paciente_id})

    return{'Message': f"paciente con ID {paciente_id} eliminado correctamente"}

