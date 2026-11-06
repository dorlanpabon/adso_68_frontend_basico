
import { useState } from 'react'
import { login } from '../services/loginService.js'

const Login = () => {

  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [mensaje, setMensaje] = useState('')


  const onSubmit = async (e) => {
    e.preventDefault() // evitar que la pagina recargue
    console.log({ usuario, clave })
    const data = await login(usuario, clave)
    console.log(data)
    setMensaje(data.message)
  }

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit}>
        <input type="text" name="usuario" id="usuario" placeholder='Usuario'
          value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <input type="password" name="clave" id="clave" placeholder='Clave'
          value={clave} onChange={(e) => setClave(e.target.value)} />
        <button type="submit">Iniciar sesión</button>
      </form>
      <p>{mensaje}</p>
    </div>
  )
}

export { Login }