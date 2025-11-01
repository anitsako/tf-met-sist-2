from typing import List
from fastapi import APIRouter, HTTPException
from schemas.cliente import Cliente, ClienteIn
from config.database import db

router = APIRouter()

@router.get('/', response_model=List[Cliente])
async def traer_clientes():
    return await db.fetch_all("SELECT * FROM clientes")

@router.get('/{cliente_id}', response_model=Cliente)
async def traer_un_cliente(cliente_id: int):
    row = await db.fetch_one("SELECT * FROM clientes WHERE id = :id", {"id": cliente_id})
    if not row:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return row

@router.post('/', response_model=Cliente)
async def crear_clientes(cliente: ClienteIn):
    query = """
        INSERT INTO clientes (dni, nombre, apellido, direccion, telefono)
        VALUES (:dni, :nombre, :apellido, :direccion, :telefono)
    """
    last_id = await db.execute(query, cliente.dict())
    return {**cliente.dict(), "id": last_id}

@router.put('/{cliente_id}', response_model=Cliente)
async def modificar_clientes(cliente_id: int, cliente: ClienteIn):
    query = """
        UPDATE clientes SET
            dni = :dni,
            nombre = :nombre,
            apellido = :apellido,
            direccion = :direccion,
            telefono = :telefono
        WHERE id = :id
    """
    await db.execute(query, {**cliente.dict(), "id": cliente_id})
    return {**cliente.dict(), "id": cliente_id}

@router.delete('/{cliente_id}')
async def eliminar_clientes(cliente_id: int):
    existing = await db.fetch_one("SELECT * FROM clientes WHERE id = :id", {"id": cliente_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    await db.execute("DELETE FROM clientes WHERE id = :id", {"id": cliente_id})
    return {"message": f"Cliente {cliente_id} eliminado"}
