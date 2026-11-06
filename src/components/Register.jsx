
import { useState } from 'react'
import { register } from '../services/registerService.js'

const Register = () => {

  const [usuarioRegistro, setUsuarioRegistro] = useState('')
  const [claveRegistro, setClaveRegistro] = useState('')
  const [mensajeRegistro, setMensajeRegistro] = useState('')

  const onSubmitRegistro = async (e) => {
    e.preventDefault() // evitar que la pagina recargue
    console.log({ usuarioRegistro, claveRegistro })
    const data = await register(usuarioRegistro, claveRegistro)
    console.log(data)
    setMensajeRegistro(data.message)
  }

  return (
    <>
      {/* Register */}
      <h2>Registrarse</h2>
      <form onSubmit={onSubmitRegistro}>
        <input type="text" name="usuario" id="usuario" placeholder='Usuario'
          value={usuarioRegistro} onChange={(e) => setUsuarioRegistro(e.target.value)} />
        <input type="password" name="clave" id="clave" placeholder='Clave'
          value={claveRegistro} onChange={(e) => setClaveRegistro(e.target.value)} />
        <button type="submit">Registrarse</button>
      </form>
      <p>{mensajeRegistro}</p>
    </>
  )
}

export { Register }