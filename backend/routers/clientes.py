from typing import List
from fastapi import APIRouter, HTTPException
from schemas.cliente import Cliente, ClienteIn
from config.database import db
import bcrypt

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
    existing = await db.fetch_one(
        "SELECT * FROM clientes WHERE direccion = :direccion",
        {"direccion": cliente.direccion}
    )
    if existing:
        raise HTTPException(status_code=400, detail='Ya existe una cuenta con esa dirección')

    # Hashear contraseña
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(cliente.contraseña.encode('utf-8'), salt).decode('utf-8')

    query = """
        INSERT INTO clientes (dni, nombre, apellido, direccion, telefono, contraseña)
        VALUES (:dni, :nombre, :apellido, :direccion, :telefono, :contraseña)
    """
    last_id = await db.execute(query, {
        "dni": cliente.dni,
        "nombre": cliente.nombre,
        "apellido": cliente.apellido,
        "direccion": cliente.direccion,
        "telefono": cliente.telefono,
        "contraseña": hashed
    })
    return {**cliente.dict(), "id": last_id}

@router.put('/{cliente_id}', response_model=Cliente)
async def modificar_clientes(cliente_id: int, cliente: ClienteIn):
    # Hashear la nueva contraseña antes de actualizar
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(cliente.contraseña.encode('utf-8'), salt).decode('utf-8')

    query = """
        UPDATE clientes SET
            dni = :dni,
            nombre = :nombre,
            apellido = :apellido,
            direccion = :direccion,
            telefono = :telefono,
            contraseña = :contraseña
        WHERE id = :id
    """
    await db.execute(query, {**cliente.dict(), "id": cliente_id, "contraseña": hashed})
    return {**cliente.dict(), "id": cliente_id}

@router.delete('/{cliente_id}')
async def eliminar_clientes(cliente_id: int):
    existing = await db.fetch_one("SELECT * FROM clientes WHERE id = :id", {"id": cliente_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    await db.execute("DELETE FROM clientes WHERE id = :id", {"id": cliente_id})
    return {"message": f"Cliente {cliente_id} eliminado"}
