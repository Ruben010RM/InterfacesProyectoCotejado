<template>
  <div
    class="vh-100 d-flex align-items-center justify-content-center bg-light flex-column my-4 p-4"
  >
    <div class="card shadow-sm w-100" style="max-width: 540px">
      <div class="card-body">
        <h5 class="card-title text-center mb-4">Formulario de Contacto</h5>

        <form @submit.prevent="enviarMensaje" class="mb-4 rounded-4">
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input
              v-model="form.nombre"
              type="text"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <input
              v-model="form.email"
              type="email"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Asunto</label>
            <input
              v-model="form.asunto"
              type="text"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Mensaje</label>
            <textarea
              v-model="form.mensaje"
              class="form-control"
              rows="4"
              required
            ></textarea>
          </div>

          <div class="d-grid">
            <button
              :disabled="enviando"
              type="submit"
              class="btn btn-primary d-flex g-3 justify-content-center text-center"
            >
              <i class="bi bi-send-fill me-2"></i>
              <span v-if="!enviando">Enviar</span>
              <span v-else>Enviando...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5906.54201227203!2d-8.692645823424254!3d42.25138484195979!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2f62e588cfce69%3A0x378485bfa6edd1be!2sIES%20de%20Teis!5e0!3m2!1ses!2ses!4v1765361977695!5m2!1ses!2ses"
      width="600"
      height="450"
      style="border: 0"
      allowfullscreen=""
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      class="mt-5 rounded-4"
    >
    </iframe>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { enviarContacto } from "../api/contacto";
import Swal from "sweetalert2";

//Formulario reactivo
const form = reactive({
  nombre: "",
  email: "",
  asunto: "",
  mensaje: "",
});

//Estado de envio
const enviando = ref(false);

//Función para enviar mensaje
async function enviarMensaje() {
  if (enviando.value) return;
  enviando.value = true;

  try {
    const data = await enviarContacto(form);

    if (data.ok) {
      Swal.fire({
        icon: "success",
        title: "¡Mensaje enviado!",
        text: "Gracias por contactarnos. Te responderemos lo antes posible.",
        confirmButtonText: "Aceptar",
      });
    } else {
      throw new Error("Respuesta inesperada del servidor");
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al enviar",
      text:
        error.response?.data?.message ||
        "Hubo un problema al enviar tu mensaje. Inténtalo de nuevo.",
      confirmButtonText: "Aceptar",
    });
  } finally {
    enviando.value = false;
    //Limpiar formulario
    form.nombre = "";
    form.email = "";
    form.asunto = "";
    form.mensaje = "";
  }
}
</script>
