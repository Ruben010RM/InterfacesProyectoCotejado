const API_URL = "http://localhost:5000/api/contacto";
import axios from "axios";

export async function enviarContacto(formulario) {
  try {
    const response = await axios.post(API_URL, formulario);
    return response.data;
  } catch (error) {
    console.error("Error al enviar contacto:", error);
    throw error;
  }
}
