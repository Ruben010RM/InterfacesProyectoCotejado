<template>
  <div class="container-fluid my-4 p-4 border rounded-4 shadow-lg bg-white">
    <h4
      class="text-center mb-4 fw-semibold text-primary border-bottom pb-2 mt-2"
    >
      <i class="bi bi-car-front me-2"></i>Registro de Vehículos
    </h4>

    <form @submit.prevent="guardarVehiculo">
      <!-- FILA: Tipo, Marca, Modelo -->
      <div class="row g-3 align-items-center mt-1">
        <div class="col-12 col-md-3 d-flex align-items-center">
          <label class="form-label mb-0 me-3 text-nowrap fw-medium"
            >Tipo:</label
          >
          <div class="d-flex align-items-center">
            <div
              class="form-check form-check-inline"
              v-for="tipo in tiposVehiculo"
            >
              <input
                class="form-check-input text"
                type="radio"
                id="tipo-coche"
                :value="tipo"
                v-model="vehiculo.tipo"
              />
              <label class="form-check-label" for="tipo-coche">{{
                tipo
              }}</label>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-2 d-flex align-items-center">
          <label
            for="matricula"
            class="form-label mb-0 me-3 text-nowrap fw-medium"
            >Matricula:</label
          >
          <input
            type="text"
            id="matricula"
            @blur="validarMatricula"
            v-model="vehiculo.matricula"
            :class="{ 'is-invalid': !matriculaValida }"
            class="form-control shadow-none"
          />
        </div>

        <div class="col-12 col-md-2 d-flex align-items-center">
          <label for="marca" class="form-label mb-0 me-3 text-nowrap fw-medium"
            >Marca:</label
          >
          <input
            type="text"
            id="marca"
            v-model="vehiculo.marca"
            class="form-control rounded shadow-none border"
            required
          />
        </div>

        <div class="col-12 col-md-2 d-flex align-items-center">
          <label for="modelo" class="form-label mb-0 me-3 text-nowrap fw-medium"
            >Modelo:</label
          >
          <input
            type="text"
            id="modelo"
            v-model="vehiculo.modelo"
            class="form-control rounded shadow-none border"
            required
          />
        </div>

        <div class="col-12 col-md-2 d-flex align-items-center">
          <label for="anio" class="form-label mb-0 me-3 text-nowrap fw-medium"
            >Año:</label
          >
          <input
            type="text"
            id="anio"
            v-model="vehiculo.anio"
            class="form-control rounded shadow-none border"
            required
          />
        </div>
      </div>

      <!-- FILA: Kilómetros, Precio, Combustible, Transmisión -->
      <div class="row g-3 align-items-center mt-2">
        <div class="col-12 col-md-3 d-flex align-items-center">
          <label
            for="kilometros"
            class="form-label mb-0 me-3 text-nowrap fw-medium"
            >Kilómetros:</label
          >
          <input
            type="number"
            id="kilometros"
            v-model="vehiculo.kilometros"
            class="form-control rounded shadow-none border text-end"
            required
          />
        </div>

        <div class="col-12 col-md-2 d-flex align-items-center">
          <label for="precio" class="form-label mb-0 me-3 text-nowrap fw-medium"
            >Precio (€):</label
          >
          <input
            type="number"
            id="precio"
            v-model="vehiculo.precio"
            class="form-control rounded shadow-none border text-end"
            required
          />
        </div>

        <div class="col-12 col-md-2 d-flex align-items-center">
          <label
            for="combustible"
            class="form-label mb-0 me-3 text-nowrap fw-medium"
            >Combustible:</label
          >
          <select
            id="combustible"
            v-model="vehiculo.combustible"
            class="form-select rounded shadow-none border"
          >
            <option disabled value="">Seleccione</option>
            <option
              v-for="combustible in tiposCombustible"
              :value="combustible"
            >
              {{ combustible }}
            </option>
          </select>
        </div>

        <div class="col-12 col-md-3 d-flex align-items-center">
          <label
            for="transmision"
            class="form-label mb-0 me-3 text-nowrap fw-medium"
            >Transmisión:</label
          >
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              id="transmision-manual"
              value="manual"
              v-model="vehiculo.transmision"
            />
            <label class="form-check-label" for="transmision-manual"
              >Manual</label
            >
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              id="transmision-automatica"
              value="automatica"
              v-model="vehiculo.transmision"
            />
            <label class="form-check-label" for="transmision-automatica"
              >Automática</label
            >
          </div>
        </div>

        <div class="col-12 col-md-2 d-flex align-items-center">
          <label
            for="potencia"
            class="form-label mb-0 me-3 text-nowrap fw-medium"
            >Potencia (CV):</label
          >
          <input
            type="text"
            id="potencia"
            v-model="vehiculo.potencia_cv"
            class="form-control rounded shadow-none border"
          />
        </div>

        <div class="col-12 col-md-2 d-flex align-items-center">
          <label class="orm-label mb-0 me-3 text-nowrap fw-medium"
            >Estado:</label
          >
          <select
            v-model="vehiculo.estado"
            class="form-select d-inline-block w-auto rounded shadow-none border"
          >
            <option value="disponible">Disponible</option>
            <option value="vendido">Vendido</option>
            <option value="reservado">Reservado</option>
          </select>
        </div>
      </div>

      <!-- FILA: Descripción -->
      <div class="row g-2 mt-3">
        <div class="col">
          <label for="descripcion" class="form-label fw-medium"
            >Descripción:</label
          >
          <textarea
            id="descripcion"
            v-model="vehiculo.descripcion"
            rows="3"
            class="form-control rounded shadow-none border mb-2"
            placeholder="Describe el estado, revisiones, etc."
          ></textarea>
        </div>
      </div>
      <div class="row g-3 align-items-center mb-3">
        <div class="col-12 col-md-3 d-flex align-items-center">
          <label for="foto" class="form-label mb-0 me-0 text-nowrap">
            Imagen del vehiculo:</label
          >
          <input
            type="file"
            id="foto"
            accept="image/*"
            @change="onFileChange"
            class="form-control-file col-md-10 border rounded-0 shadow-none btn-file-azul"
          />
        </div>
      </div>
      <h5 class="text-center bg-primary-subtle py-1 fw-semibold rounded">
        <i class="bi bi-person me-2"></i>Cliente Ubicación
      </h5>
      <!-- FILA: Ubicación -->
      <div class="row g-3 align-items-center mt-3">
        <div class="col-12 col-md-4">
          <label for="provincia" class="form-label fw-medium">Provincia:</label>
          <select
            id="provincia"
            v-model="vehiculo.ubicacion.provincia"
            class="form-select rounded shadow-none border"
            @change="filtrarCiudades"
          >
            <option disabled value="">Seleccione provincia</option>
            <option v-for="prov in provincias" :key="prov.id" :value="prov.nm">
              {{ prov.nm }}
            </option>
          </select>
        </div>

        <div class="col-12 col-md-4">
          <label for="ciudad" class="form-label fw-medium">Ciudad:</label>
          <select
            id="ciudad"
            v-model="vehiculo.ubicacion.ciudad"
            class="form-select rounded shadow-none border"
          >
            <option disabled value="">Seleccione ciudad</option>
            <option
              v-for="mun in municipiosFiltrados"
              :key="mun.id"
              :value="mun.nm"
            >
              {{ mun.nm }}
            </option>
          </select>
        </div>

        <div class="col-12 col-md-4">
          <label for="fecha_publicacion" class="form-label fw-medium"
            >Fecha Publicación:</label
          >
          <input
            type="date"
            id="fecha_publicacion"
            v-model="vehiculo.fecha_publicacion"
            class="form-control rounded shadow-none border"
          />
        </div>
      </div>

      <!-- FILA: Contacto -->
      <div class="row g-3 align-items-center mt-3">
        <div class="col-12 col-md-4">
          <label for="contacto_nombre " class="form-label fw-medium"
            >Nombre Contacto:</label
          >
          <input
            type="text"
            id="contacto_nombre"
            v-model="vehiculo.contacto.nombre"
            class="form-control rounded shadow-none border"
          />
        </div>
        <div class="col-12 col-md-4">
          <label for="contacto_telefono" class="form-label fw-medium"
            >Teléfono:</label
          >
          <input
            type="tel"
            id="contacto_telefono"
            v-model="vehiculo.contacto.telefono"
            class="form-control rounded shadow-none border"
          />
        </div>
        <div class="col-12 col-md-4">
          <label for="contacto_email" class="form-label fw-medium"
            >Email:</label
          >
          <input
            type="email"
            id="contacto_email"
            v-model="vehiculo.contacto.email"
            class="form-control rounded shadow-none border"
          />
        </div>
      </div>

      <!-- FILA: Estado y botón -->
      <div class="row g-3 align-items-center mt-3">
        <div class="col-12 d-flex align-items-center justify-content-center m">
          <div>
            <button
              type="submit"
              class="btn btn-primary rounded border shadow-none px-4 py-2"
            >
              {{ editando ? "Modificar" : "Guardar" }}
            </button>
            <button
              type="submit"
              class="btn btn-outline-danger rounded border-danger shadow-none px-4 py-2 ms-2"
            >
              Eliminar
            </button>
            <button
              type="button"
              @click="imprimirPDF"
              class="btn btn-secondary rounded border shadow-none px-4 py-2 ms-2"
            >
              <i class="bi bi-printer"></i>Imprimir
            </button>
          </div>
        </div>
      </div>
    </form>
    <div class="mt-5">
      <h6 class="text-center mb-1 bg-secondary text-white">
        Listado de Modelos
      </h6>
      <table
        class="table table-bordered table-striped table-sm table-hover table-sm align-middle"
      >
        <thead>
          <tr class="table-primary text-center">
            <th>Matrícula</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Estado</th>
            <th>Contacto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody v-for="(vehiculo, index) in vehiculos">
          <tr class="text-center">
            <td>{{ vehiculo.matricula }}</td>
            <td>{{ vehiculo.marca }}</td>
            <td>{{ vehiculo.modelo }}</td>
            <td>{{ vehiculo.estado.toUpperCase() }}</td>
            <td>
              {{ vehiculo.contacto?.nombre }}
              {{ vehiculo.contacto?.telefono }}
            </td>
            <td>
              <button
                type="button"
                class="btn btn-sm btn-danger me-2"
                @click="eliminarVehiculo(index)"
              >
                <i class="bi bi-trash"></i>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-warning me-1"
                @click="editarVehiculo(vehiculo.matricula)"
              >
                <i class="bi bi-pencil"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import Swal from "sweetalert2";
import { ref, computed, onMounted } from "vue";
import { addArticulo } from "@/api/articulos.js";
import provmuniData from "@/data/provmuni.json";
import { getArticulos } from "../api/articulos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const archivo = ref(null);
const tiposVehiculo = ref(["Coche", "Moto", "Furgoneta"]);
const tiposCombustible = ref(["Gasolina", "Diésel", "Híbrido", "Eléctrico"]);
const matriculaValida = ref(true);
const matriculaRegex = /^[0-9]{4}[A-Za-z]{3}/;

const vehiculos = ref([]);

const vehiculo = ref({
  tipo: "",
  matricula: "",
  marca: "",
  modelo: "",
  anio: "",
  estado: "",
  kilometros: "",
  precio: "",
  combustible: "",
  transmision: "",
  potencia_cv: "",
  descripcion: "",
  ubicacion: {
    provincia: "",
    ciudad: "",
  },
  contacto: {
    nombre: "",
    telefono: "",
    email: "",
  },
  fecha_publicacion: "",
  estado: "disponible",
});

const editando = ref(false);

// Cargar provincias y municipios desde JSON
const provincias = ref(provmuniData.provincias);
const municipios = ref(provmuniData.municipios);
const municipiosFiltrados = ref([]);

// Filtrar municipios según provincia seleccionada
const filtrarCiudades = () => {
  const nombreProv = vehiculo.value.ubicacion.provincia;
  const prov = provincias.value.find((p) => p.nm === nombreProv);
  if (!prov) {
    municipiosFiltrados.value = [];
    return;
  }
  const codigoProv = prov.id.slice(0, 2);
  municipiosFiltrados.value = municipios.value.filter((m) =>
    m.id.startsWith(codigoProv)
  );
  vehiculo.value.ubicacion.ciudad = "";
};

const validarMatricula = () => {
  vehiculo.value.matricula = vehiculo.value.matricula.trim().toUpperCase();
  const matricula = vehiculo.value.matricula;

  if (matricula === "") {
    matriculaValida.value = true;
    return true;
  }

  matriculaValida.value = matriculaRegex.test(matricula);
  return matriculaValida.value;
};
const capitalizarContacto = (campo) => {
  const texto = vehiculo.value.contacto[campo] ?? "";
  if (texto.trim() === "") return;
  vehiculo.value.contacto[campo] = texto
    .toLowerCase()
    .split(" ")
    .map((palabra) => {
      if (!palabra) return "";
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(" ");
};

onMounted(async () => {
  vehiculos.value = await getArticulos();
});

// Validar teléfono
const telefonoValido = ref(true);
const telefonoRegex = /^[67]\d{8}$/;

const validarTelefono = () => {
  const telefono = vehiculo.value.contacto.telefono.trim();

  if (telefono === "") {
    telefonoValido.value = true; // Vacío = válido (opcional)
    return true;
  }

  if (telefono.charAt(0) === "6" || telefono.charAt(0) === "7") {
    telefonoValido.value = telefonoRegex.test(telefono);
    return telefonoValido.value;
  } else {
    telefonoValido.value = false;
    return false;
  }
};

// Validar email
const emailValido = ref(true);
const validarEmail = () => {
  const email = vehiculo.value.contacto.email.trim();
  if (email === "") {
    emailValido.value = true; // Vacío = válido (opcional)
    return true;
  }
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  emailValido.value = regex.test(email);
};

// Enviar datos al backend
const guardarVehiculo = async () => {
  // Validar teléfono antes de guardar
  if (!telefonoValido.value) {
    Swal.fire({
      icon: "error",
      title: "Teléfono inválido",
      text: "El teléfono debe empezar por 6 o 7 y tener 9 dígitos.",
      showConfirmButton: true,
    });
    return;
  }

  // Validar email antes de guardar
  if (!emailValido.value) {
    Swal.fire({
      icon: "error",
      title: "Email inválido",
      text: "Por favor, introduce un email válido.",
      showConfirmButton: true,
    });
    return;
  }
  if (!matriculaValida.value) {
    Swal.fire({
      icon: "error",
      title: "Matrícula inválida",
      text: "Por favor, introduce una matrícula válida.",
      showConfirmButton: true,
    });
    return;
  }

  try {
    const formData = new FormData();
    if (archivo.value) {
      formData.append("imagen", archivo.value);
    }
    formData.append("vehiculo", JSON.stringify(vehiculo.value));
    const nuevo = await addArticulo(formData);
    if (nuevo && nuevo._id) {
      Swal.fire({
        icon: "success",
        title: "Vehículo guardado",
        text: "El vehículo ha sido guardado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      console.error("Error al guardar el vehículo");
    }
    vehiculo.value = {
      tipo: "",
      matricula: "",
      marca: "",
      modelo: "",
      anio: "",
      estado: "disponible",
      kilometros: "",
      precio: "",
      combustible: "",
      transmision: "",
      potencia_cv: "",
      descripcion: "",
      ubicacion: {
        provincia: "",
        ciudad: "",
      },
      contacto: {
        nombre: "",
        telefono: "",
        email: "",
      },
      fecha_publicacion: "",
    };
    matriculaValida.value = true;
  } catch (error) {
    console.error("Error al guardar:", error);
  }
};

const onFileChange = (e) => {
  archivo.value = e.target.files[0];
};

function imprimirPDF() {
  const doc = new jsPDF();

  // Verificar si autoTable está disponible
  if (typeof autoTable !== "function") {
    console.error("jspdf-autotable no está cargado correctamente");
    Swal.fire("Error", "Plugin autotable no disponible", "error");
    return;
  }

  doc.setFontSize(18);
  doc.text("Listado de Vehículos", 12, 20);

  const headers = [["Matrícula", "Marca", "Estado", "Combustible", "Precio"]];
  const body = vehiculos.value.map((modelo) => [
    modelo.matricula || "",
    modelo.marca || "",
    modelo.estado?.toUpperCase() || "",
    modelo.combustible || "",
    modelo.precio ? `${modelo.precio}` : "",
  ]);

  autoTable(doc, {
    startY: 30,
    head: headers,
    body: body,
    theme: "striped",
    styles: {
      fontSize: 10,
      cellPadding: 3,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      4: {
        halign: "right",
        cellWidth: 35,
      },
    },
  });

  doc.save("listado_vehiculos.pdf");
}

async function editarVehiculo(matricula) {
  const vehiculoActual = vehiculos.value.find(matricula);
  if (!vehiculoActual) {
    return;
  }
  editando.value = true;
}
</script>
<style scoped></style>
