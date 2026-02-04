import axios from "axios";

let API_URL = "http://localhost:5000/api/auth/taller";

export async function getCita() {
  try {
    return axios
      .get(API_URL, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })
      .then((res) => res.data);
  } catch (error) {
    console.error("Error al conseguir las citas", error);
    throw error;
  }
}
export async function addCita(cita) {
  try {
    await axios.post(API_URL, cita, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    });
  } catch (error) {
    console.error("Error al añadir la cita", error);
    throw error;
  }
}
export async function deleteCita(id) {
  try {
    await axios.delete(API_URL + `/${id}`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
  } catch (error) {
    console.error("Error al borrar la cita", error);
    throw error;
  }
}

export async function updateCita(id, cita) {
  try {
    await axios.put(API_URL + `/${id}`, cita, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
  } catch (error) {
    console.error("Error al actualizar la cita", error);
    throw error;
  }
}
