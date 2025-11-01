from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import db
from routers import clientes, pacientes, especialidad
from routers import clientes, pacientes, especialidad, turnos

app = FastAPI(title="TP MS II - Sistema de Turnos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

@app.get("/")
async def root():
    return {"message": "Bienvenidos a mi API REST"}


app.include_router(turnos.router, prefix="/turnos", tags=["Turnos"])
app.include_router(pacientes.router, prefix="/pacientes", tags=["Pacientes"])
app.include_router(profesionales.router, prefix="/profesionales", tags=["Profesionales"])
app.include_router(especialidad.router, prefix="/especialidades", tags=["Especialidades"])
