from typing import List
from fastapi import APIRouter, HTTPException, status
from config.database import db
from schemas.turno import Turno, TurnoIn, TurnoEstadoUpdate

router = APIRouter()

@router.get("/", response_model=List[Turno])
async def listar_turnos():
    return await db.fetch_all("SELECT * FROM turnos ORDER BY fecha, hora")

@router.post("/", status_code=status.HTTP_201_CREATED)
async def crear_turno(body: TurnoIn):
    # llama al Stored Procedure sp_asignar_turno
    try:
        await db.execute(
            "CALL sp_asignar_turno(:paciente_id, :profesional_id, :fecha, :hora)",
            values=body.dict(),
        )
        row = await db.fetch_one("""
            SELECT * FROM turnos
            WHERE paciente_id=:paciente_id AND profesional_id=:profesional_id
              AND fecha=:fecha AND hora=:hora
            ORDER BY id DESC LIMIT 1
        """, body.dict())
        return row
    except Exception as e:
        # Railway devuelve el mensaje del SIGNAL (p.ej. 'Horario ocupado')
        raise HTTPException(400, str(e))

@router.put("/{turno_id}/estado", response_model=Turno)
async def cambiar_estado(turno_id: int, body: TurnoEstadoUpdate):
    exist = await db.fetch_one("SELECT * FROM turnos WHERE id=:id", {"id": turno_id})
    if not exist:
        raise HTTPException(404, "Turno no encontrado")
    await db.execute("UPDATE turnos SET estado=:estado WHERE id=:id",
                     {"estado": body.estado, "id": turno_id})
    row = await db.fetch_one("SELECT * FROM turnos WHERE id=:id", {"id": turno_id})
    return row

@router.delete("/{turno_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_turno(turno_id: int):
    exist = await db.fetch_one("SELECT id FROM turnos WHERE id=:id", {"id": turno_id})
    if not exist:
        raise HTTPException(404, "Turno no encontrado")
    await db.execute("DELETE FROM turnos WHERE id=:id", {"id": turno_id})
    return

# -------- Reportes (para el Dashboard) --------

@router.get("/reporte/agenda")
async def reporte_agenda():
    q = """
    SELECT t.id, t.fecha, t.hora, t.estado,
           CONCAT(pac.nombre,' ',pac.apellido) AS paciente,
           CONCAT(prof.nombre,' ',prof.apellido) AS profesional,
           esp.nombre AS especialidad
    FROM turnos t
    JOIN pacientes pac ON pac.id=t.paciente_id
    JOIN profesionales prof ON prof.id=t.profesional_id
    JOIN especialidades esp ON esp.id=prof.especialidad_id
    ORDER BY t.fecha, t.hora
    """
    return await db.fetch_all(q)

@router.get("/reporte/estadistica-especialidad")
async def reporte_especialidad():
    q = """
    SELECT esp.nombre AS especialidad, t.estado, COUNT(*) AS cantidad
    FROM turnos t
    JOIN profesionales prof ON prof.id=t.profesional_id
    JOIN especialidades esp ON esp.id=prof.especialidad_id
    GROUP BY esp.nombre, t.estado
    ORDER BY esp.nombre, t.estado
    """
    return await db.fetch_all(q)

@router.get("/reporte/top-profesionales")
async def top_profesionales(limit: int = 5):
    q = f"""
    SELECT profesional_id,
           (SELECT CONCAT(nombre,' ',apellido)
              FROM profesionales pr
             WHERE pr.id=t.profesional_id) AS profesional,
           COUNT(*) AS total_turnos
    FROM turnos t
    GROUP BY profesional_id
    ORDER BY total_turnos DESC
    LIMIT {int(limit)}
    """
    return await db.fetch_all(q)
