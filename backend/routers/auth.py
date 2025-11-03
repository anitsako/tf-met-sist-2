from config.database import db
from fastapi import APIRouter, HTTPException
from schemas.cliente import ClienteLogin
import bcrypt

router = APIRouter()


@router.post('/login')
async def login(cliente: ClienteLogin):
    
    user = await db.fetch_one('SELECT * FROM clientes WHERE direccion = :direccion', {"direccion" : cliente.direccion})

    if not user:
        raise HTTPException(status_code=400, detail='Email inválido')
    
    hashed_pass = user['contraseña']

    if not bcrypt.checkpw(cliente.contraseña.encode('utf-8'), hashed_pass.encode('utf-8')):
        raise HTTPException(status_code=400, detail='Contraseña inválida')


    
    return {'success': True, 'usuario': user['nombre']}
