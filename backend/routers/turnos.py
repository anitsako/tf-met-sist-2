from typing import List
from fastapi import APIRouter, HTTPException, status
from config.database import db
from schemas.turno import Turno, TurnoIn, TurnoEstadoUpdate, TurnoOut

router = APIRouter()

@router.get("/", response_model=List[TurnoOut])
async def listar_turnos_completo():
    query = """
        SELECT t.id, t.fecha, TIME_FORMAT(t.hora, '%H:%i') AS hora, t.estado,
               CONCAT(p.nombre, ' ', p.apellido) AS paciente,
               CONCAT(pr.nombre, ' ', pr.apellido) AS profesional,
               e.nombre AS especialidad
        FROM turnos t
        JOIN pacientes p  ON t.paciente_id   = p.id
        JOIN profesionales pr ON t.profesional_id = pr.id
        JOIN especialidades e ON e.id = pr.especialidad_id
        ORDER BY t.fecha, t.hora
    """
    return await db.fetch_all(query)

@router.post("/", response_model=Turno, status_code=status.HTTP_201_CREATED)
async def crear_turno(body: TurnoIn):
    try:
        await db.execute(
            "CALL sp_asignar_turno(:paciente_id, :profesional_id, :fecha, :hora)",
            values=body.dict(),
        )
        row = await db.fetch_one("""
            SELECT id, paciente_id, profesional_id, fecha, hora, estado
            FROM turnos
            WHERE paciente_id=:paciente_id AND profesional_id=:profesional_id
              AND fecha=:fecha AND hora=:hora
            ORDER BY id DESC LIMIT 1
        """, body.dict())
        return row
    except Exception as e:
        # Devolver el mensaje claro del SIGNAL
        msg = str(e)
        if "Horario ocupado" in msg:
            raise HTTPException(status_code=409, detail="Horario ocupado")
        raise HTTPException(status_code=400, detail=msg)

@router.put("/{turno_id}/estado", response_model=Turno)
async def cambiar_estado(turno_id: int, body: TurnoEstadoUpdate):
    exist = await db.fetch_one("SELECT * FROM turnos WHERE id=:id", {"id": turno_id})
    if not exist:
        raise HTTPException(404, "Turno no encontrado")
    # normaliza a minúsculas
    estado = body.estado.strip().lower()
    if estado not in ("pendiente","confirmado","reprogramado","cancelado"):
        raise HTTPException(400, "Estado inválido")
    await db.execute("UPDATE turnos SET estado=:estado WHERE id=:id",
                     {"estado": estado, "id": turno_id})
    row = await db.fetch_one("SELECT * FROM turnos WHERE id=:id", {"id": turno_id})
    return row

@router.delete("/{turno_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_turno(turno_id: int):
    exist = await db.fetch_one("SELECT id FROM turnos WHERE id=:id", {"id": turno_id})
    if not exist:
        raise HTTPException(404, "Turno no encontrado")
    await db.execute("DELETE FROM turnos WHERE id=:id", {"id": turno_id})
    return

@router.get("/pendientes/hoy", response_model=List[TurnoOut])
async def turnos_pendientes_hoy():
    """Turnos pendientes/confirmados desde hoy en adelante (máx 5)"""
    query = """
        SELECT t.id, t.fecha, TIME_FORMAT(t.hora, '%H:%i') AS hora, t.estado,
               CONCAT(p.nombre, ' ', p.apellido) AS paciente,
               CONCAT(pr.nombre, ' ', pr.apellido) AS profesional,
               e.nombre AS especialidad
        FROM turnos t
        JOIN pacientes p  ON t.paciente_id   = p.id
        JOIN profesionales pr ON t.profesional_id = pr.id
        JOIN especialidades e ON e.id = pr.especialidad_id
        WHERE t.estado IN ('pendiente','confirmado')
          AND t.fecha >= CURDATE()
        ORDER BY t.fecha, t.hora
        LIMIT 5
    """
    return await db.fetch_all(query)

# -------- Reportes --------
@router.get("/reporte/agenda", response_model=List[TurnoOut])
async def reporte_agenda():
    q = """
    SELECT t.id, t.fecha, TIME_FORMAT(t.hora, '%H:%i') AS hora, t.estado,
           CONCAT(pac.nombre,' ',pac.apellido) AS paciente,
           CONCAT(prof.nombre,' ',prof.apellido) AS profesional,
           esp.nombre AS especialidad
    FROM turnos t
    JOIN pacientes pac       ON pac.id=t.paciente_id
    JOIN profesionales prof  ON prof.id=t.profesional_id
    JOIN especialidades esp  ON esp.id=prof.especialidad_id
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
    q = """
    SELECT
      t.profesional_id,
      CONCAT(pr.nombre,' ',pr.apellido) AS profesional,
      COUNT(*) AS total_turnos
    FROM turnos t
    JOIN profesionales pr ON pr.id=t.profesional_id
    GROUP BY t.profesional_id, profesional
    ORDER BY total_turnos DESC
    LIMIT :limit
    """
    return await db.fetch_all(q, {"limit": int(limit)})
