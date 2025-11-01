from typing import List
from fastapi import APIRouter, HTTPException, status
from config.database import db
from schemas.profesional import Profesional, ProfesionalIn

router = APIRouter()

@router.get("/", response_model=List[Profesional])
async def listar_profesionales():
    return await db.fetch_all("SELECT * FROM profesionales ORDER BY apellido, nombre")

@router.get("/{profesional_id}", response_model=Profesional)
async def traer_un_profesional(profesional_id: int):
    row = await db.fetch_one("SELECT * FROM profesionales WHERE id=:id", {"id": profesional_id})
    if not row:
        raise HTTPException(404, "Profesional no encontrado")
    return row

@router.post("/", response_model=Profesional, status_code=status.HTTP_201_CREATED)
async def crear_profesional(body: ProfesionalIn):
    query = """
      INSERT INTO profesionales (nombre, apellido, especialidad_id, matricula)
      VALUES (:nombre, :apellido, :especialidad_id, :matricula)
    """
    new_id = await db.execute(query, body.dict())
    return {**body.dict(), "id": new_id}

@router.put("/{profesional_id}", response_model=Profesional)
async def actualizar_profesional(profesional_id: int, body: ProfesionalIn):
    exist = await db.fetch_one("SELECT id FROM profesionales WHERE id=:id", {"id": profesional_id})
    if not exist:
        raise HTTPException(404, "Profesional no encontrado")
    query = """
      UPDATE profesionales
      SET nombre=:nombre, apellido=:apellido,
          especialidad_id=:especialidad_id, matricula=:matricula
      WHERE id=:id
    """
    await db.execute(query, {**body.dict(), "id": profesional_id})
    return {**body.dict(), "id": profesional_id}

@router.delete("/{profesional_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_profesional(profesional_id: int):
    exist = await db.fetch_one("SELECT id FROM profesionales WHERE id=:id", {"id": profesional_id})
    if not exist:
        raise HTTPException(404, "Profesional no encontrado")
    await db.execute("DELETE FROM profesionales WHERE id=:id", {"id": profesional_id})
    return
