<template>
  <div
    class="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
  >
    <div
      class="card shadow-lg border-0 rounded-4 p-5"
      style="max-width: 500px; width: 100%"
    >
      <div class="card-body text-center">
        <h1 class="text-primary display-4 fw-bold mb-4">
          <i class="bi bi-check-circle-fill me-2"></i>
          ¡Pago Completado!
        </h1>

        <p class="lead text-muted mb-5">
          Gracias por tu compra. Hemos enviado un correo con los detalles.
        </p>

        <div class="mb-5">
          <p class="mb-4 fs-6 text-dark">
            Descargue su factura en formato PDF:
          </p>
          <button
            @click="generarFacturaPdf"
            class="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow"
          >
            <i class="bi bi-file-earmark-pdf me-2"></i>Descargar Factura
          </button>
        </div>

        <router-link to="/ventas" class="btn btn-outline-primary px-4 py-2">
          <i class="bi bi-arrow-left me-2"></i>Volver a la tienda
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useCestaStore } from "../store/cesta";
import logo from "../assets/logo.png";
import { addFactura } from "../api/facturas";
import { onMounted, onUnmounted, ref } from "vue";
import { updateArticuloStatus } from "../api/articulos";
// Creamos la cesta para usar metodos y datos
const cestaStore = useCestaStore();
//Como ya no queremos los datos visibles(vaciar iconos y cesta), pasamos los datos a la variable invisible
cestaStore.completarCompra();

const facturaGuardada = ref(false);

async function guardarFacturaMongo() {
  if (facturaGuardada.value || cestaStore.compraCompleta.length === 0) return;

  try {
    const factura = {
      productos: cestaStore.compraCompleta.map((producto) => ({
        productoId: producto._id || producto.id,
        nombre:
          producto.nombre || `${producto.marca ?? ""} ${producto.modelo ?? ""}`,
        cantidad: producto.cantidad,
        precio_unitario: producto.precio,
      })),
      total: cestaStore.precioFinal,
    };
    await addFactura(factura);
    facturaGuardada.value = true;
    console.log("Factura guardada en MongoDB");
  } catch (error) {
    console.error("Error guardando la factura", error);
  }
}

onMounted(async () => {
  await guardarFacturaMongo();
  //Por cada articulo de la cesta actualiza su estado a vendido
  for (const articulo of cestaStore.compraCompleta) {
    const articuloId = articulo._id || articulo.id;
    await updateArticuloStatus(articuloId, "vendido");
  }
});

async function generarFacturaPdf() {
  const cart = cestaStore.compraCompleta;

  if (cart.length === 0) {
    alert("No hay productos para facturar");
    return;
  }

  const doc = new jsPDF();

  // LOGO y TÍTULO (simple)
  doc.addImage(logo, "PNG", 15, 10, 25, 25);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURA", 105, 25, { align: "center" });
  doc.setFontSize(12);
  doc.text("Regalos Teis", 105, 35, { align: "center" });

  // DATOS EMPRESA (alineados)
  doc.setFontSize(10);
  doc.text("Avenida Galicia 101, Vigo - 36216", 150, 50);
  doc.text("Tlf: 986 666 333", 150, 56);
  doc.text("regalos@example.com", 150, 62);

  // TABLA PRODUCTOS (perfectamente formada)
  const headers = [["ID", "Producto", "Cant.", "P. Unitario (€)", "Total (€)"]];
  const data = cart.map((item) => [
    item.id.toString(),
    item.nombre,
    item.cantidad.toString(),
    item.precio.toFixed(2),
    (item.cantidad * item.precio).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 75,
    head: headers,
    body: data,
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 35 },
      1: { cellWidth: 70 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "right", cellWidth: 30 },
      4: { halign: "right", cellWidth: 35, fontStyle: "bold" },
    },
    margin: { left: 15, right: 15 },
  });

  // TOTAL (destacado y centrado)
  const totalPrice = cestaStore.precioFinal;
  const finalY = doc.lastAutoTable.finalY + 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`TOTAL: ${totalPrice.toFixed(2)} €`, 175, finalY, {
    align: "right",
  });

  // Guardar
  doc.save(`factura_${Date.now()}.pdf`);
}
onUnmounted(() => {
  // Limpiar
  cestaStore.clearCesta();
});
</script>

<style scoped>
/* Solo overrides mínimos de Bootstrap */
.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}
</style>
