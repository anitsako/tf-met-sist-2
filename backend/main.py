from fastapi import FastAPI
from config.database import db
from routers import cliente


app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Bienvenidos a mi API REST"}


app.include_router(cliente.router, prefix="/clientes")