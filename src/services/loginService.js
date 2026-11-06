
const login = async (usuario, clave) => {
  try {
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ usuario, clave })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return { message: 'Error en la solicitud' };
  }
};

export { login };