<template>
  <div class="container-fluid my-4 p-4 border rounded-4 shadow-lg bg-white">
    <!-- Título principal -->
    <h4 class="text-center mb-4 fw-semibold text-primary border-bottom pb-2">
      <i class="bi bi-wrench me-2"></i>Taller
    </h4>

    <!-- Formulario -->
    <form
      @submit.prevent="guardarCita"
      class="p-3 bg-light rounded-3 border shadow-sm"
    >
      <!-- Matrícula con botón lupa a la derecha -->
      <div class="row g-3 mb-3 align-items-center">
        <div class="col-md-2">
          <label for="matricula" class="form-label fw-medium">Matrícula</label>
          <input
            type="text"
            id="matricula"
            class="form-control form-control-sm shadow-none"
            placeholder="Ej: 1234ABC"
            @blur="validarMatricula"
            v-model="nuevaCita.matricula"
            :class="{ 'is-invalid': !matriculaValida }"
            required
          />
        </div>

        <!-- Botón limpiar arriba derecha -->
        <div class="col-md-10 justify-content-end d-flex">
          <button
            type="button"
            class="btn btn-outline-primary shadow-sm"
            @click="limpiarPagina"
            title="Limpiar formulario"
          >
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
        </div>
      </div>

      <!-- Resto campos en filas -->
      <div class="row g-3">
        <div class="col-md-6">
          <label for="movil" class="form-label fw-medium">Móvil</label>
          <input
            type="tel"
            id="movil"
            @blur="validarMovil"
            class="form-control form-control-sm shadow-none"
            v-model="nuevaCita.movilCliente"
            :class="{ 'is-invalid': !movilValido }"
            required
          />
        </div>

        <div class="col-md-6">
          <label for="fechaCita" class="form-label fw-medium">Fecha Cita</label>
          <input
            type="date"
            id="fechaCita"
            class="form-control form-control-sm shadow-none"
            v-model="nuevaCita.fechaCita"
            required
          />
        </div>
      </div>

      <div
        class="row g-3 mt-2 align-items-center d-flex justify-content-center"
      >
        <div class="col-md-6">
          <label for="servicioTaller" class="form-label fw-medium"
            >Servicio</label
          >
          <select
            id="servicioTaller"
            v-model="nuevaCita.servicioTaller"
            class="form-select form-select-sm shadow-none"
            required
          >
            <option disabled value="">Seleccione un servicio</option>
            <option
              v-for="opcion in opcionesServicio"
              :key="opcion"
              :value="opcion"
            >
              {{ opcion }}
            </option>
          </select>
        </div>

        <div class="col-md-6 d-flex justify-content-center gap-3 mt-5">
          <label for="estadoCita" class="form-label fw-medium"
            >Estado Cita:</label
          >
          <input
            type="radio"
            value="Pendiente"
            class="form-check-input"
            v-model="nuevaCita.estadoCita"
          /><label for="">Pendiente</label>
          <input
            type="radio"
            value="Finalizado"
            class="form-check-input"
            v-model="nuevaCita.estadoCita"
            :disabled="!editando"
          /><label>Finalizado</label>
        </div>

        <!-- Columna derecha: checkbox ITV at right -->
        <div class="col-md-6 d-flex justify-content-center align-items-center">
          <div class="form-check">
            <input
              type="checkbox"
              id="acepta"
              v-model="nuevaCita.acepta"
              class="form-check-input"
            />
            <label for="acepta" class="form-check-label"
              >Acepta el presupuesto</label
            >
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-center mt-4">
        <button
          type="submit"
          class="btn btn-primary px-4 shadow-sm"
          :disabled="!nuevaCita.acepta"
        >
          {{ editando ? "Modificar" : "Agendar" }}
        </button>
      </div>
    </form>

    <!-- Tabla -->
    <div class="table-responsive mt-4" v-if="citas.length > 0">
      <table
        class="table table-hover table-bordered align-middle text-center table-striped"
      >
        <thead class="table-primary">
          <tr>
            <th>ID</th>
            <th>Matrícula</th>
            <th>Móvil Cliente</th>
            <th>Fecha Cita</th>
            <th>Servicio Taller</th>
            <th>Estado Cita</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cita, index) in citasPaginadas" :key="cita.id || index">
            <td>{{ (currentPage - 1) * citasPorPage + index + 1 }}</td>
            <td>{{ cita.matricula }}</td>
            <td>{{ cita.movilCliente }}</td>
            <td>{{ cita.fechaCita }}</td>
            <td>{{ cita.servicioTaller }}</td>
            <td>{{ cita.estadoCita }}</td>
            <td>
              <button
                class="btn btn-sm btn-danger me-2 shadow-none"
                @click="borrarCita(cita.id)"
              >
                <i class="bi bi-trash"></i>
              </button>
              <button
                class="btn btn-sm btn-warning me-2 shadow-none"
                @click="editarCita(cita.id)"
              >
                <i class="bi bi-pencil"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      class="d-flex justify-content-center align-items-center my-3"
      v-if="citas.length > 0"
    >
      <button
        class="btn btn-outline-primary btn-sm rounded border-1 shadow-none me-2"
        @click="beforePagina"
        :disabled="currentPage <= 1"
      >
        <i class="bi bi-chevron-left"></i>
      </button>
      <span class="text-muted mx-3">Página {{ currentPage }}</span>
      <button
        class="btn btn-outline-primary btn-sm rounded border-1 shadow-none"
        @click="nextPagina"
        :disabled="currentPage >= totalPages"
      >
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import Swal from "sweetalert2";
import { getCita, addCita, deleteCita, updateCita } from "../api/citasTaller";
import { getClientes } from "../api/clientes";

const opcionesServicio = [
  "Revision",
  "PreITV",
  "Neumáticos",
  "Frenos",
  "Cambio de aceite",
];
const movilValido = ref(true);
const movilRegex = /^[67]\d{8}$/;
const matriculaValida = ref(true);
const matriculaRegex = /^[0-9]{4}[A-Za-z]{3}/;
const citas = ref([]);
const nuevaCita = ref({
  matricula: "",
  movilCliente: "",
  fechaCita: "",
  servicioTaller: "",
  estadoCita: "Pendiente",
  acepta: false,
});
async function cargarCitas() {
  try {
    Swal.fire({
      icon: "success",
      title: "Listando Citas...",
      showConfirmButton: false,
      timer: 1500,
    });
    citas.value = await getCita();
    citas.value = citas.value.sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha),
    );
  } catch (error) {
    console.error("Fallo al cargar los datos de la bbdd", error);
  }
}
const clientes = ref([]);
const editando = ref(false);
const citaEditandoId = ref("");
const citasPorPage = 5;
const currentPage = ref(1);
const numCitas = ref(0);

onMounted(async () => {
  await cargarCitas();
  getClientes().then((data) => {
    clientes.value = data;
  });
  currentPage.value = 1;
  numCitas.value = citas.value.length;
});

async function guardarCita() {
  if (
    !nuevaCita.value.matricula.trim() ||
    !nuevaCita.value.movilCliente.trim() ||
    !nuevaCita.value.fechaCita ||
    !nuevaCita.value.servicioTaller
  ) {
    alert("Por favor rellena los campos solicitados");
    return;
  }
  // Validar duplicados solo si estás creando (no si editando)
  if (!editando.value) {
    const movilCliente = clientes.value.find(
      (cliente) => cliente.movil === nuevaCita.value.movilCliente,
    );
    const movilDuplicado = citas.value.find(
      (cita) => cita.movilCliente === nuevaCita.value.movilCliente,
    );
    if (movilDuplicado || movilCliente) {
      const aceptarMovilDuplicado = await Swal.fire({
        title:
          "Usuario ya registrado en la sección clientes ¿Desea continuar igualmente?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: editando.value ? "Modificar" : "Añadir",
        cancelButtonText: "Cancelar",
      });
      if (!aceptarMovilDuplicado.isConfirmed) {
        return;
      }
    }
  }

  const result = await Swal.fire({
    title: editando.value
      ? "¿Desea modificar esta cita?"
      : "¿Desea agendar esta cita?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: editando.value ? "Modificar" : "Agendar",
    cancelButtonText: "Cancelar",
  });
  if (!result.isConfirmed) {
    return;
  }

  if (editando.value) {
    const index = citas.value.findIndex(
      (cita) => cita.id === citaEditandoId.value,
    );
    if (index !== -1) {
      citas.value[index] = { ...nuevaCita.value };
    }
    try {
      await updateCita(citaEditandoId.value, nuevaCita.value);
      Swal.fire({
        icon: "success",
        title: "Cita modificada",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error al actualizar cita", error);
      Swal.fire({
        icon: "error",
        title: "Error al modificar cita",
        text: "Inténtelo de nuevo o contacte con el administrador.",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } else {
    const citaNueva = {
      matricula: nuevaCita.value.matricula.toUpperCase(),
      movilCliente: nuevaCita.value.movilCliente,
      fechaCita: nuevaCita.value.fechaCita,
      servicioTaller: nuevaCita.value.servicioTaller,
      estadoCita: nuevaCita.value.estadoCita,
      acepta: nuevaCita.value.acepta,
    };
    try {
      await addCita(citaNueva);
      citas.value.unshift(citaNueva);
      citas.value = citas.value.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha),
      );
      await cargarCitas();

      Swal.fire({
        icon: "success",
        title: "Cita agendada",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Fallo al añadir la nueva cita a la BBDD", error);
      Swal.fire({
        icon: "error",
        title: "Error al añadir cita",
        text: "Inténtelo de nuevo o contacte con el administrador.",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }

  limpiarPagina();
}

async function borrarCita(id) {
  try {
    const result = await Swal.fire({
      title: `¿Eliminar la cita?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    await deleteCita(id);
    citas.value = citas.value.filter((cita) => cita.id !== id);
    Swal.fire({
      icon: "success",
      title: "Cita eliminada",
      showConfirmButton: false,
      timer: 1500,
    });
  } catch (error) {
    console.error("Error a la hora de eliminar la cita", error);
    Swal.fire({
      icon: "error",
      title: "Error al eliminar cita",
      text: "Inténtelo de nuevo o contacte con el administrador.",
      showConfirmButton: false,
      timer: 1500,
    });
  }
  limpiarPagina();
}

async function editarCita(id) {
  editando.value = true;
  const cita = { ...citas.value.find((cita) => cita.id === id) };
  if (!cita && !cita.id) return alert("Mal ahi");
  nuevaCita.value = { ...cita };
  citaEditandoId.value = cita.id;
}

function limpiarPagina() {
  nuevaCita.value.matricula = "";
  nuevaCita.value.movilCliente = "";
  nuevaCita.value.fechaCita = "";
  nuevaCita.value.servicioTaller = "";
  nuevaCita.value.estadoCita = "Pendiente";
  nuevaCita.value.acepta = false;
  editando.value = false;
  movilValido.value = true;
}

const validarMovil = () => {
  const movil = nuevaCita.value.movilCliente.trim();

  if (movil === "") {
    movilValido.value = true; // Vacío = válido (opcional)
    return true;
  }

  if (movil.charAt(0) === "6" || movil.charAt(0) === "7") {
    movilValido.value = movilRegex.test(movil);
    return movilValido.value;
  } else {
    movilValido.value = false;
    return false;
  }
};

const validarMatricula = () => {
  nuevaCita.value.matricula = nuevaCita.value.matricula.trim().toUpperCase();
  const matricula = nuevaCita.value.matricula;

  if (matricula === "") {
    matriculaValida.value = true;
    return true;
  }

  matriculaValida.value = matriculaRegex.test(matricula);
  return matriculaValida.value;
};
const nextPagina = () => {
  const totalPages = Math.ceil(numCitas.value / citasPorPage); //redondear hacia arriba para mostrar la última página aunque no esté completa
  if (currentPage.value < totalPages) {
    currentPage.value++;
  }
};

const beforePagina = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};
const citasPaginadas = computed(() => {
  const start = (currentPage.value - 1) * citasPorPage;
  const end = start + citasPorPage;
  citas.value = citas.value.sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha),
  );
  return citas.value.slice(start, end);
});
</script>
<style scoped></style>
