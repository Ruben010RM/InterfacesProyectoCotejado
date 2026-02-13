<template>
  <!-- Sección de Ventas / Catálogo -->
  <div class="mt-5 catalogo-ventas container">
    <h4
      class="text-center mb-4 fw-semibold text-primary border-bottom pb-2 mt-2"
    >
      <i class="bi bi-cash-coin me-2"></i>Vehículos en Venta
    </h4>

    <div class="row g-4 justify-content-center">
      <div
        class="col-xl-3 col-lg-4 col-md-6 col-sm-12"
        v-for="(auto, index) in vehiculos"
        :key="auto.matricula"
      >
        <div class="card h-100 border-0 shadow-sm hover-card">
          <img
            :src="urlImagen(auto.imagen)"
            class="card-img-top rounded-top"
            alt="Imagen del vehículo"
            style="object-fit: cover; height: 180px"
          />
          <div class="card-body p-3">
            <h5 class="card-title fw-bold text-primary mb-2 fs-5">
              {{ auto.marca }} {{ auto.modelo }}
            </h5>
            <div class="info-grid mb-3">
              <p class="mb-1 text-black-50 fs-6">
                <i class="bi bi-calendar3 me-1 text-primary"></i>
                <strong class="text-dark">Año:</strong> {{ auto.anio }}
              </p>
              <p class="mb-1 text-black-50 fs-6">
                <i class="bi bi-speedometer me-1 text-primary"></i>
                <strong class="text-dark">Km:</strong>
                {{ Number(auto.kilometros || 0).toLocaleString() }}
              </p>
              <p class="mb-0 text-black-50 fs-6 fw-bold">
                <i class="bi bi-currency-euro me-1 text-success"></i>
                {{ Number(auto.precio || 0).toLocaleString() }} €
              </p>
            </div>
          </div>
          <div class="card-footer bg-white border-0 p-3">
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <button
                class="btn btn-sm px-3 flex-fill"
                :class="
                  auto.estado === 'disponible' ? 'btn-primary' : 'btn-secondary'
                "
                :disabled="auto.estado !== 'disponible'"
                @click.stop="agregarACesta(auto)"
              >
                <i class="bi bi-cart me-1"></i>
                {{ auto.estado === "disponible" ? "COMPRAR" : "NO DISPONIBLE" }}
              </button>
              <button
                class="btn btn-sm px-3 btn-outline-primary flex-fill"
                @click="locate(auto._id)"
              >
                <i class="bi bi-eye me-1"></i>DETALLES
              </button>
              <button
                class="btn btn-sm px-3 btn-outline-info flex-fill"
                @click.stop="generateFacturaVehiculoPDF(auto)"
              >
                <i class="bi bi-printer me-1"></i>PDF
              </button>
              <button
                class="btn btn-sm px-3 btn-outline-warning flex-fill"
                @click="locateReserva(auto._id)"
              >
                <i class="bi bi-calendar-check me-1"></i>RESERVA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getArticulos } from "../api/articulos";
import { useCestaStore } from "../store/cesta";
import { useRouter } from "vue-router";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const cestaStore = useCestaStore();
const router = useRouter();
function agregarACesta(vehiculo) {
  cestaStore.addProducto({
    id: vehiculo._id,
    nombre: `${vehiculo.marca} ${vehiculo.modelo}`,
    precio: vehiculo.precio,
    imagen: urlImagen(vehiculo.imagen),
  });
}

const vehiculos = ref([]);

function locate(id) {
  router.push({ name: "CarDetails", params: { id: id } });
}
function locateReserva(id) {
  router.push({ name: "ReservarVehiculo", params: { id: id } });
}

onMounted(async () => {
  vehiculos.value = await getArticulos();
});

function urlImagen(ruta) {
  if (!ruta) return;
  return `http://localhost:5000${ruta}`;
}

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
  // PASO 5: Generamos el nombre del archivo y descargamos el PDF
  const fecha = new Date().toISOString().split("T")[0]; // Fecha actual en formato AAAA-MM-DD
  const matriculaLimpia = (vehiculo.matricula || "SIN-MATRICULA").replace(
    /\s+/g,
    "_",
  ); // Quitamos espacios
  const nombreArchivo = `ficha_${matriculaLimpia}_${fecha}.pdf`;

  // Guardamos/descargamos el PDF con el nombre generado
  doc.save(nombreArchivo);
}
</script>
<style scoped>
.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
}

.info-grid p {
  margin-bottom: 0.25rem !important;
}

.card-footer {
  border-top: 1px solid #e9ecef !important;
}

.btn {
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

@media (max-width: 768px) {
  .d-flex.flex-wrap {
    flex-direction: column;
  }

  .btn {
    flex: 1 1 100%;
  }

  .col-sm-12 {
    margin-bottom: 1rem;
  }
}

@media (max-width: 576px) {
  .card-body {
    padding: 1rem !important;
  }

  .card-footer {
    padding: 1rem !important;
  }
}
</style>
