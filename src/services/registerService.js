const register = async (usuario, clave) => {
  try {
    const res = await fetch("http://localhost:3000/api/register", {
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
    return 'Error en la solicitud';
  }
};

export { register };