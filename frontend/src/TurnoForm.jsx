// src/assets/TurnoForm.jsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { api } from './api'

export function TurnoForm({ onCreated }) {
  const { register, handleSubmit, reset } = useForm()
  const [pacientes, setPacientes] = useState([])
  const [profesionales, setProfesionales] = useState([])

  useEffect(() => {
    Promise.allSettled([api.get('/pacientes'), api.get('/profesionales')])
      .then(([p, pr]) => {
        if (p.status === 'fulfilled') setPacientes(p.value.data)
        if (pr.status === 'fulfilled') setProfesionales(pr.value.data)
      })
  }, [])

  const onSubmit = async (data) => {
  const turno = {
    paciente_id: parseInt(data.paciente_id),
    profesional_id: parseInt(data.profesional_id),
    fecha: data.fecha,
    hora: data.hora,
  }

    await api.post('/turnos', turno)     // en backend esto llama al SP
    reset()
    onCreated?.()
  }

  return (
    <div className='card d-flex p-2 m-5 justify-content-center align-items-center align-self-center border border-primary'>
      <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="col-md-6">
          <label className="form-label">Paciente</label>
          <select className="form-select" {...register('paciente_id', { required: true })}>
            <option value="">Seleccione…</option>
            {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Profesional</label>
          <select className="form-select" {...register('profesional_id', { required: true })}>
            <option value="">Seleccione…</option>
            {profesionales.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Fecha</label>
          <input type="date" className="form-control" {...register('fecha', { required: true })}/>
        </div>

        <div className="col-md-6">
          <label className="form-label">Hora</label>
          <input type="time" className="form-control" {...register('hora', { required: true })}/>
        </div>

        <div className="col-12">
          <button className="btn btn-primary" type="submit">Guardar</button>
        </div>
      </form>
    </div>
  )
}
