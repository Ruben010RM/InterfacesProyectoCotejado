<template>
  <div
    class="min-vh-75 d-flex flex-column justify-content-center align-items-center py-5 mt-5"
  >
    <div v-if="vehiculo" class="row g-4 w-100" style="max-width: 900px">
      <!-- Card del vehículo (izquierda) -->
      <div class="col-lg-7 col-md-8">
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
          >
            <button
              class="btn btn-lg w-100 rounded-3"
              :class="
                vehiculo.estado === 'disponible'
                  ? 'btn-primary shadow-sm'
                  : 'btn-secondary disabled'
              "
              @click.stop="agregarACesta(vehiculo)"
            >
              <i class="bi bi-cart me-2"></i>
              {{ vehiculo.estado.toUpperCase() }}
            </button>
            <button
              class="btn btn-lg w-100 rounded-3 btn-outline-info"
              @click.stop="generateFacturaVehiculoPDF(vehiculo)"
            >
              <i class="bi bi-printer"></i> Imprimir
            </button>
          </div>
        </div>
      </div>

      <!-- Datos de contacto (derecha) -->
      <div class="col-lg-5 col-md-4">
        <div class="card shadow border-0 rounded-4 h-100 bg-light">
          <div class="card-body p-4">
            <h6 class="card-title fw-bold text-primary mb-4">
              <i class="bi bi-person-lines-fill me-2"></i>
              Contacto
            </h6>

            <div v-if="contacto" class="contacto-info">
              <div class="mb-3">
                <small class="text-muted d-block mb-1">
                  <i class="bi bi-person me-1"></i>Nombre:
                </small>
                <strong>{{ contacto.nombre }}</strong>
              </div>

              <div class="mb-3">
                <small class="text-muted d-block mb-1">
                  <i class="bi bi-envelope me-1"></i>Email:
                </small>
                <strong>{{ contacto.email }}</strong>
              </div>

              <div class="mb-3">
                <small class="text-muted d-block mb-1">
                  <i class="bi bi-telephone me-1"></i>Teléfono:
                </small>
                <strong>{{ contacto.telefono }}</strong>
              </div>
            </div>

            <div v-else class="text-center text-muted py-4">
              <i class="bi bi-person-x fs-1 mb-3"></i>
              <p class="mb-0">Datos de contacto no disponibles</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="card shadow border-0 rounded-4 text-center p-5"
      style="max-width: 400px; width: 100%"
    >
      <div
        class="spinner-border spinner-border-lg text-primary mb-3"
        role="status"
      >
        <span class="visually-hidden">Cargando...</span>
      </div>
      <h6 class="text-muted mb-0">Cargando vehículo...</h6>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getArticuloById } from "../api/articulos";
import { useCestaStore } from "../store/cesta";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const route = useRoute();
const cesta = useCestaStore();
const vehiculo = ref();
const contacto = ref();

function urlImagen(ruta) {
  if (!ruta) return;
  return `http://localhost:5000${ruta}`;
}

function agregarACesta(vehiculo) {
  cesta.addProducto({
    id: vehiculo._id,
    nombre: `${vehiculo.marca} ${vehiculo.modelo}`,
    precio: vehiculo.precio,
    imagen: urlImagen(vehiculo.imagen),
  });
}

onMounted(async () => {
  const id = route.params.id;
  vehiculo.value = await getArticuloById(id);
  contacto.value = vehiculo.value.contacto;
  console.log(contacto.value);
});

function generateFacturaVehiculoPDF(vehiculo) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Colores elegantes y suaves
  const colorPrimario = [54, 117, 136]; // Azul petróleo
  const colorSecundario = [240, 245, 249]; // Gris azulado claro
  const colorTexto = [40, 40, 40];

  // Fondo superior con suave degradado visual (rectángulo sólido)
  doc.setFillColor(...colorPrimario);
  doc.rect(0, 0, 210, 40, "F");

  // TÍTULO principal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("Ficha del Vehículo", 105, 20, { align: "center" });

  // Sombra bajo título
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(40, 25, 170, 25);

  // Matrícula resaltada en una “tarjeta” visual
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(60, 30, 90, 12, 3, 3, "F");
  doc.setTextColor(...colorPrimario);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`Matrícula: ${vehiculo.matricula || "Sin matrícula"}`, 105, 38, {
    align: "center",
  });

  // Datos del vehículo
  const datosVehiculo = [
    ["Tipo de vehículo", vehiculo.tipo || "-"],
    ["Marca", vehiculo.marca || "-"],
    ["Modelo", vehiculo.modelo || "-"],
    ["Año", vehiculo.anio ? String(vehiculo.anio) : "-"],
    [
      "Kilómetros",
      vehiculo.kilometros
        ? `${vehiculo.kilometros.toLocaleString("es-ES")} km`
        : "-",
    ],
    [
      "Precio",
      vehiculo.precio ? `${vehiculo.precio.toLocaleString("es-ES")} €` : "-",
    ],
    ["Combustible", vehiculo.combustible || "-"],
    ["Transmisión", vehiculo.transmision || "-"],
    ["Potencia", vehiculo.potencia_cv ? `${vehiculo.potencia_cv} CV` : "-"],
    ["Estado", vehiculo.estado || "-"],
    ["Provincia", vehiculo.ubicacion?.provincia || "-"],
    ["Ciudad", vehiculo.ubicacion?.ciudad || "-"],
    ["Contacto - Nombre", vehiculo.contacto?.nombre || "-"],
    ["Contacto - Teléfono", vehiculo.contacto?.telefono || "-"],
    ["Contacto - Email", vehiculo.contacto?.email || "-"],
    [
      "Fecha de publicación",
      vehiculo.fecha_publicacion
        ? new Date(vehiculo.fecha_publicacion).toLocaleDateString("es-ES")
        : "-",
    ],
    ["Descripción", vehiculo.descripcion || "Sin descripción"],
  ];

  // TABLA visual moderna
  autoTable(doc, {
    head: [["Campo", "Valor"]],
    body: datosVehiculo,
    startY: 48,
    margin: { left: 15, right: 15 },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 10,
      textColor: colorTexto,
      cellPadding: 3,
      lineColor: [225, 230, 235],
    },
    headStyles: {
      fillColor: colorPrimario,
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: colorSecundario },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: 115 },
    },
  });

  // Pie de página elegante
  const paginaAltura = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text(
    "Documento PDF generado automáticamente • VehículosApp",
    105,
    paginaAltura - 10,
    { align: "center" },
  );

  // Nombre de archivo final
  const fecha = new Date().toISOString().split("T")[0];
  const matriculaLimpia = (vehiculo.matricula || "SIN-MATRICULA").replace(
    /\s+/g,
    "_",
  );
  const nombreArchivo = `ficha_${matriculaLimpia}_${fecha}.pdf`;

  doc.save(nombreArchivo);
}
</script>
<style scoped></style>
