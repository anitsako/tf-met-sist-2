from typing import List
from fastapi import APIRouter, HTTPException, status
from schemas.cliente import Cliente, ClienteIn
from config.database import db

router = APIRouter()

@router.get("/", response_model=List[Cliente])
async def traer_clientes():
    rows = await db.fetch_all("SELECT * FROM clientes")
    return rows

@router.get("/{cliente_id}", response_model=Cliente)
async def traer_un_cliente(cliente_id: int):
    row = await db.fetch_one("SELECT * FROM clientes WHERE id = :id", values={"id": cliente_id})
    if not row:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return row

@router.post("/", response_model=Cliente, status_code=status.HTTP_201_CREATED)
async def crear_clientes(cliente: ClienteIn):
    query = """
        INSERT INTO clientes (dni, nombre, apellido, direccion, telefono)
        VALUES (:dni, :nombre, :apellido, :direccion, :telefono)
    """
    last_id = await db.execute(query=query, values=cliente.dict())
    return {**cliente.dict(), "id": last_id}

@router.put("/{cliente_id}", response_model=Cliente)
async def modificar_clientes(cliente_id: int, cliente: ClienteIn):
    exist = await db.fetch_one("SELECT id FROM clientes WHERE id=:id", {"id": cliente_id})
    if not exist:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    query = """
        UPDATE clientes
        SET dni=:dni,
            nombre=:nombre,
            apellido=:apellido,
            direccion=:direccion,
            telefono=:telefono
        WHERE id=:id
    """
    await db.execute(query=query, values={**cliente.dict(), "id": cliente_id})
    return {**cliente.dict(), "id": cliente_id}

@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_clientes(cliente_id: int):
    exist = await db.fetch_one("SELECT id FROM clientes WHERE id=:id", {"id": cliente_id})
    if not exist:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    await db.execute("DELETE FROM clientes WHERE id=:id", {"id": cliente_id})
    return  # 204 No Content
