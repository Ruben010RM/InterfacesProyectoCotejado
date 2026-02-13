<template>
  <div
    class="min-vh-75 d-flex flex-column justify-content-center align-items-center py-5 mt-5"
  >
    <div v-if="vehiculo" class="row g-4 w-100" style="max-width: 900px">
      <!-- Card del vehículo (izquierda) -->
      <div class="col-lg-6 col-md-8">
        <div class="card shadow border-0 rounded-4 h-100">
          <img
            v-if="vehiculo?.imagen"
            :src="urlImagen(vehiculo.imagen)"
            class="card-img-top rounded-top-4"
            alt="Imagen del vehículo"
            style="height: 200px; object-fit: cover"
          />
          <div
            v-else
            class="card-img-top bg-light d-flex align-items-center justify-content-center rounded-top-4"
            style="height: 200px"
          >
            <i class="bi bi-car-front text-muted fs-1"></i>
          </div>

          <div class="card-body p-4">
            <h5 class="card-title fw-bold text-primary mb-3">
              {{ vehiculo.marca }} {{ vehiculo.modelo }}
            </h5>

            <div class="mb-3">
              <small class="text-muted d-block mb-1">Año:</small>
              {{ vehiculo.anio }}
            </div>

            <div class="mb-3">
              <small class="text-muted d-block mb-1">Kilómetros:</small>
              {{ Number(vehiculo.kilometros || 0).toLocaleString() }} km
            </div>

            <div class="mb-4">
              <strong class="h4 text-primary d-block">
                {{ Number(vehiculo.precio || 0).toLocaleString() }} €
              </strong>
            </div>
          </div>

          <div
            class="card-footer bg-transparent border-0 p-4 pt-0 gap-1 d-flex flex-column"
          ></div>
        </div>
      </div>

      <!-- Datos de contacto (derecha) -->
      <div class="col-lg-6 col-md-4">
        <div class="card shadow border-0 rounded-4 h-100 bg-light">
          <div class="card-body p-4">
            <h6 class="card-title fw-bold text-primary mb-4">
              <i class="bi bi-calendar-check me-2"></i>
              Formulario de Reserva:
            </h6>

            <form class="contacto-info" @submit.prevent="hacerReserva">
              <div class="mb-3">
                <small class="text-muted d-block mb-1">
                  <i class="bi bi-card-heading me-1"></i>DNI:
                </small>
                <input
                  type="text"
                  @blur="validarDni"
                  v-model="reservaForm.dni"
                  class="form-control w-100 me-2"
                  :class="{ 'is-invalid': !dniValido }"
                />
              </div>
              <div class="mb-3">
                <small class="text-muted d-block mb-1">
                  <i class="bi bi-person me-1"></i>Nombre:
                </small>
                <input
                  type="text"
                  v-model="reservaForm.nombre"
                  class="form-control w-100 me-2"
                />
              </div>

              <div class="mb-3">
                <small class="text-muted d-block mb-1">
                  <i class="bi bi-envelope me-1"></i>Email:
                </small>
                <input
                  type="text"
                  @blur="validarEmail"
                  v-model="reservaForm.email"
                  class="form-control w-100 me-2"
                  :class="{ 'is-invalid': !emailValido }"
                />
              </div>

              <div class="mb-3">
                <small class="text-muted d-block mb-1">
                  <i class="bi bi-telephone me-1"></i>Teléfono:
                </small>
                <input
                  type="text"
                  @blur="validarMovil"
                  v-model="reservaForm.numero"
                  class="form-control w-100 me-2"
                  :class="{ 'is-invalid': !numeroValido }"
                />
              </div>
              <button
                type="submit"
                class="btn btn-md"
                :class="
                  vehiculo?.estado === 'disponible'
                    ? 'btn-outline-warning'
                    : 'disabled btn-secondary'
                "
              >
                <i class="bi bi-calendar-check me-2"></i
                >{{
                  vehiculo.estado === "disponible"
                    ? "RESERVAR"
                    : vehiculo.estado === "reservado"
                      ? "RESERVADO"
                      : "VENDIDO"
                }}
              </button>
              <button
                type="button"
                v-if="isAdmin && vehiculo.estado === 'reservado'"
                class="btn btn-md btn-outline-danger ms-5"
                @click.stop="cancelarReserva"
              >
                <i class="bi bi-x-circle"></i>
                ANULAR RESERVA
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getArticuloById, updateArticuloStatus } from "../api/articulos";
import Swal from "sweetalert2";
import { esAdmin } from "../api/authApi";
const route = useRoute();
const vehiculo = ref();
const dniValido = ref(true); // Por defecto es válido y no muestra error al iniciar
const emailValido = ref(true);
const numeroValido = ref(true);
const isAdmin = ref(false);
const movilRegex = /^[67]\d{8}$/;

const validarMovil = () => {
  const movil = reservaForm.value.numero.trim();

  if (movil === "") {
    numeroValido.value = true; // Vacío = válido (opcional)
    return true;
  }

  if (movil.charAt(0) === "6" || movil.charAt(0) === "7") {
    numeroValido.value = movilRegex.test(movil);
    return numeroValido.value;
  } else {
    numeroValido.value = false;
    return false;
  }
};
const reservaForm = ref({
  nombre: "",
  numero: "",
  dni: "",
  email: "",
});

function urlImagen(ruta) {
  if (!ruta) return;
  return `http://localhost:5000${ruta}`;
}

const validarEmail = () => {
  const email = reservaForm.value.email.trim();
  if (email === "") {
    emailValido.value = true; // Vacío = válido (opcional)
    return true;
  }
  // Expresión simple para email válido
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailValido.value = regex.test(email);
};

const validarDniNie = (valor) => {
  const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
  const dniRegex = /^[0-9]{8}[A-Z]$/;
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;

  valor = valor.toUpperCase();
  if (valor === "") {
    dniValido.value = true; // Vacío = válido (opcional)
    return true;
  } else if (dniRegex.test(valor)) {
    const numero = parseInt(valor.slice(0, 8), 10);
    const letra = valor.charAt(8);
    return letra === letras[numero % 23]; //sale con true si es válido
  } else if (nieRegex.test(valor)) {
    const nie = valor.replace("X", "0").replace("Y", "1").replace("Z", "2");
    const numero = parseInt(nie.slice(0, 8), 10);
    const letra = valor.charAt(8);
    return letra === letras[numero % 23]; //sale con true si es válido
  }
  return false;
};
const validarDni = () => {
  reservaForm.value.dni = reservaForm.value.dni.trim().toUpperCase();
  dniValido.value = validarDniNie(reservaForm.value.dni);
};
onMounted(async () => {
  const id = route.params.id;
  vehiculo.value = await getArticuloById(id);
  const token = sessionStorage.getItem("token");
  console.log(token);

  isAdmin.value = await esAdmin();
});
async function cancelarReserva() {
  if (vehiculo.value.estado !== "reservado") {
    mostrarAlerta(
      "No es posible cancelar reserva",
      "No existe una reserva activa para este articulo",
      "warning",
    );
    return;
  }

  await updateArticuloStatus(vehiculo.value._id, "disponible");
  vehiculo.value = await getArticuloById(vehiculo.value._id);
}
async function hacerReserva() {
  if (
    !reservaForm.value.dni.trim() ||
    !reservaForm.value.email.trim() ||
    !reservaForm.value.nombre.trim() ||
    !reservaForm.value.numero.trim()
  ) {
    mostrarAlerta("Rellena el form", "Tienes campos vacíos", "warning");
    return;
  }
  if (!emailValido.value) {
    mostrarAlerta(
      "Email Inválido",
      "El email no tiene un formato válido",
      "warning",
    );
    return;
  }
  if (!dniValido.value) {
    mostrarAlerta(
      "DNI Inválido",
      "El DNI no tiene un formato válido",
      "warning",
    );
    return;
  }
  if (!numeroValido.value) {
    mostrarAlerta(
      "Número Inválido",
      "El número no tiene un formato válido",
      "warning",
    );
    return;
  }
  await updateArticuloStatus(vehiculo.value._id, "reservado");
  vehiculo.value = await getArticuloById(vehiculo.value._id);
}
function mostrarAlerta(title, text, icon) {
  Swal.fire({
    icon: icon,
    title: title,
    text: text,
    timer: 1500,
    showConfirmButton: false,
  });
}
</script>
<style scoped></style>
