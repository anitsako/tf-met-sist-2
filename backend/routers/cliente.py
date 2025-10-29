from typing import List
from fastapi import APIRouter
from schemas.cliente import Cliente ,ClienteIn
from config.database import db


router = APIRouter()

@router.get('/', response_model=List[Cliente])
async def traer_clientes():
    query = 'SELECT * FROM clientes'
    rows = await db.fetch_all(query=query)
    return rows


@router.post('/', response_model=List[Cliente])
async def crear_clientes(cliente: ClienteIn):
    query = """
        INSERT INTO clientes (dni, nombre, apellido, direccion, telefono)
        VALUES (:dni, :nombre, :apellido, :direccion, :telefono)
    """
    last_record_id = await db.execute(query=query, values=cliente.dict())
    return {**cliente.dict(), "id": last_record_id}
