<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8 col-xl-6">
        <!-- Card principal -->
        <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div class="card-header bg-primary text-white text-center py-4">
            <i class="bi bi-briefcase fs-1 mb-3"></i>
            <h3 class="mb-0 fw-bold">Postular a Empleo</h3>
            <p class="mb-0 opacity-75">Completa tus datos y sube tu CV</p>
          </div>

          <div class="card-body p-4 p-md-5">
            <form
              @submit.prevent="enviarFormulario"
              enctype="multipart/form-data"
            >
              <!-- Sección foto -->
              <div class="text-center mb-4">
                <div class="position-relative d-inline-block">
                  <img
                    :src="previewFoto"
                    class="rounded-circle border border-3 border-white shadow-sm"
                    style="width: 150px; height: 150px; object-fit: cover"
                    alt="Foto de perfil"
                  />
                  <label
                    for="fotoInput"
                    class="position-absolute bottom-0 end-0 p-2 bg-primary text-white rounded-circle shadow-sm cursor-pointer"
                  >
                    <i class="fas fa-camera fs-6"></i>
                  </label>
                  <input
                    type="file"
                    id="fotoInput"
                    ref="fotoInput"
                    class="d-none"
                    accept="image/*"
                    @change="manejarFoto"
                  />
                </div>
                <small class="text-muted mt-2 d-block"
                  >Foto opcional (máx. 2MB)</small
                >
              </div>

              <div class="row g-4">
                <!-- Datos personales -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold"
                    >Nombre completo <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="form.nombre"
                    type="text"
                    class="form-control"
                    placeholder="Juan Pérez García"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold"
                    >Teléfono <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="form.telefono"
                    type="tel"
                    class="form-control"
                    placeholder="+34 612 345 678"
                  />
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold"
                    >Email <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="form.email"
                    type="email"
                    class="form-control"
                    placeholder="juan.perez@email.com"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold"
                    >Puesto deseado <span class="text-danger">*</span></label
                  >
                  <select v-model="form.puesto" class="form-select">
                    <option value="" selected disabled="">
                      Selecciona un puesto...
                    </option>
                    <option value="desarrollador-frontend">
                      Desarrollador Frontend
                    </option>
                    <option value="desarrollador-backend">
                      Desarrollador Backend
                    </option>
                    <option value="fullstack">Desarrollador Fullstack</option>
                    <option value="diseñador-ux">Diseñador UX/UI</option>
                    <option value="devops">DevOps Engineer</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Experiencia</label>
                  <select v-model="form.experiencia" class="form-select">
                    <option value="0-1">Menos de 1 año</option>
                    <option value="1-3">1-3 años</option>
                    <option value="3-5">3-5 años</option>
                    <option value="5+">Más de 5 años</option>
                  </select>
                </div>

                <!-- CV Upload -->
                <div class="col-12">
                  <label class="form-label fw-semibold"
                    >Currículum Vitae <span class="text-danger">*</span></label
                  >
                  <div
                    class="border border-dashed border-2 rounded-4 p-4 text-center hover-border-primary transition-all"
                  >
                    <i class="fas fa-cloud-upload-alt fs-1 text-muted mb-3"></i>
                    <input
                      ref="cvInput"
                      type="file"
                      class="form-control mb-2"
                      accept=".pdf,.doc,.docx"
                      @change="manejarCV"
                    />
                    <small class="text-muted">
                      {{ cvNombre || "PDF, DOC o DOCX (máx. 5MB)" }}
                    </small>
                  </div>
                </div>

                <!-- Mensaje opcional -->
                <div class="col-12">
                  <label class="form-label fw-semibold"
                    >Mensaje (opcional)</label
                  >
                  <textarea
                    v-model="form.mensaje"
                    class="form-control"
                    rows="4"
                    placeholder="Cuéntanos por qué eres perfecto para este puesto..."
                  ></textarea>
                </div>
              </div>

              <!-- Botones -->
              <div class="d-flex gap-3 justify-content-center mt-5">
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-md px-5"
                  @click="resetForm"
                >
                  <i class="fas fa-times me-2"></i>Limpiar
                </button>
                <button
                  type="submit"
                  class="btn btn-primary btn-md px-5"
                  :disabled="cargando"
                >
                  <span
                    v-if="cargando"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  <i v-else class="fas fa-paper-plane me-2"></i>
                  {{ cargando ? "Enviando..." : "Enviar Postulación" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import Swal from "sweetalert2";
import { ref, reactive } from "vue";

const fotoInput = ref(null);
const cvInput = ref(null);
const cargando = ref(false);
const previewFoto = ref(
  "https://via.placeholder.com/150x150/6c757d/e9ecef?text=Foto",
);
const cvNombre = ref("");
const fileCV = ref(null);

//Inputs de texto del formulario
const form = reactive({
  nombre: "",
  telefono: "",
  email: "",
  puesto: "",
  experiencia: "0-1",
  mensaje: "",
});

const manejarFoto = (event) => {
  //El evento que lo dispara es el input, al notar un cambio obtenemos el archivo subiido y lo asociamos a una variable
  const file = event.target.files[0];
  if (file) {
    //Si exste este archivo hacemos estoo para poder previsualizar la imagen segun se suba
    const reader = new FileReader();
    reader.onload = (e) => {
      previewFoto.value = e.target.result;
    };
    //Con esto previsualizamos
    reader.readAsDataURL(file);
  }
};

const manejarCV = (event) => {
  //Si existe el archivo lo seteamos al fileCv, y el nombre del archivo al cvnombre
  fileCV.value = event.target.files[0]; //
  if (fileCV.value) {
    cvNombre.value = fileCV.value.name;
  }
};

//Reseteamos tanto inputs de texto como los archivos
const resetForm = () => {
  Object.assign(form, {
    nombre: "",
    telefono: "",
    email: "",
    puesto: "",
    experiencia: "0-1",
    mensaje: "",
  });
  previewFoto.value =
    "https://via.placeholder.com/150x150/6c757d/e9ecef?text=Foto";
  cvNombre.value = "";
  fileCV.value = null; //Limpiar fileCV
  if (fotoInput.value) fotoInput.value.value = "";
  if (cvInput.value) cvInput.value.value = "";
};

const enviarFormulario = async () => {
  // Validación, faltan las de formatoos
  if (
    !form.nombre.trim() ||
    !form.email.trim() ||
    !form.puesto ||
    !fileCV.value
  ) {
    Swal.fire(
      "Error",
      "Completa todos los campos obligatorios incluyendo CV",
      "error",
    );
    return;
  }

  //Seteamos cargando a true para renderizado condcional
  cargando.value = true;

  //Formdata porque es un multiparts
  const formData = new FormData();
  formData.append("nombre", form.nombre.trim());
  formData.append("telefono", form.telefono.trim());
  formData.append("email", form.email.trim());
  formData.append("puesto", form.puesto);
  formData.append("experiencia", form.experiencia);
  formData.append("mensaje", form.mensaje || "");

  // Si la foto esta puesta, ya que es opcional, la metemos al form data si no no
  //Como la fotoiinput es un ref en el input de arrba, lo que hacemos realmente es pasarle el elemento del dom como objeto al
  //foto input, por ende accedemos de este elemento al files(podriamos acceder a mas cosas como value o name)
  if (fotoInput.value?.files[0]) {
    formData.append("foto", fotoInput.value.files[0]);
  }
  //Tambien mandamos el cv, es obligatorio
  formData.append("cv", fileCV.value); //

  try {
    //intentamos hacer un poost con el formdata creado, se dan las validaciones del backend(ver empleoController)
    const response = await axios.post(
      "http://localhost:5000/api/postulaciones/upload",
      formData,
    );

    //Si no salta error sale swal
    Swal.fire({
      icon: "success",
      title: "¡Postulación enviada!",
      text: `CV guardado`,
      confirmButtonText: "Genial",
    });

    //Reseteamos el form
    resetForm();
  } catch (error) {
    Swal.fire(
      "Error",
      error.data?.error || error.message || "Error al enviar al servidor",
      "error",
    );
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.hover-border-primary:hover {
  border-color: #0d6efd !important;
}
.transition-all {
  transition: all 0.3s ease;
}
</style>
