from typing import List
from fastapi import APIRouter, HTTPException
from schemas.cliente import Cliente ,ClienteIn
from config.database import db


router = APIRouter()

@router.get('/', response_model=List[Cliente])
async def traer_clientes():
    query = 'SELECT * FROM clientes'
    rows = await db.fetch_all(query=query)
    return rows

@router.get('/{id}', response_model=[Cliente])
async def traer_un_cliente(cliente_id: int):
    query = "SELECT * FROM clientes WHERE id = :id"
    row = await db.fetch_one(query=query, values={"id":cliente_id})
    if not row:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    return row    

@router.post('/', response_model=[Cliente])
async def crear_clientes(cliente: ClienteIn):
    query = """
        INSERT INTO clientes (dni, nombre, apellido, direccion, telefono)
        VALUES (:dni, :nombre, :apellido, :direccion, :telefono)
    """
    last_record_id = await db.execute(query=query, values=cliente.dict())
    return {**cliente.dict(), "id": last_record_id}


@router.put('/{id}', response_model=[Cliente])
async def modificar_clientes(cliente_id: int, cliente: ClienteIn):
    query = """
            UPDATE clientes SET 
            dni = :dni
            nombre = :nombre
            apellido = :apellido
            direccion = :direccion
            telefono = :telefono
            WHERE id = :id
    """
    values = {**cliente.dict(), "id": cliente_id}
    await db.execute(query=query, values=values)
    return {**cliente.dict(), "id" :cliente_id}

@router.delete('/{id}', response_model=[Cliente])
async def eliminar_clientes(cliente_id: int):
    check_query = "SELECT FROM clientes WHERE id = :id"
    existing = await db.fetch_one(check_query, {"id": cliente_id})
    if not existing:
        raise HTTPException(status_code=404, detail='Cliente no encontrado')
    
    query = "DELETE FROM clientes WHERE id = :id"
    await db.execute(query=query, values={"id": cliente_id})

    return{'Message': f"Cliente con ID {cliente_id} eliminado correctamente"}