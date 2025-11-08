from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import db
from routers import clientes, pacientes, especialidad, turnos, profesionales, auth

app = FastAPI()

# CORS: permite al front (Vite) llamar al backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    try:
        print("Intentando conectar a la base de datos...")
        await db.connect()
        print("Conexión exitosa a la base de datos.")
    except Exception as e:
        print("Error al conectar a la base de datos:", e)

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

# Healthcheck de DB: ejecuta SELECT 1
@app.get("/health/db")
async def health_db():
    try:
        row = await db.fetch_one("SELECT 1 AS ok;")
        return {"ok": True, "driver": "aiomysql", "value": row["ok"]}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.get("/")
async def root():
    return {"message": "Bienvenidos a mi API REST"}

# Routers
app.include_router(clientes.router,      prefix="/clientes",       tags=["Clientes"])
app.include_router(pacientes.router,     prefix="/pacientes",      tags=["Pacientes"])
app.include_router(especialidad.router,  prefix="/especialidades", tags=["Especialidades"])
app.include_router(profesionales.router, prefix="/profesionales",  tags=["Profesionales"])
app.include_router(turnos.router,        prefix="/turnos",         tags=["Turnos"])
app.include_router(auth.router,          prefix="/auth",           tags=["Authentication"])
