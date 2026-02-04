<template>
  <!-- Sección de Ventas / Catálogo -->
  <div class="mt-5 catalogo-ventas">
    <h4
      class="text-center mb-4 fw-semibold text-primary border-bottom pb-2 mt-2"
    >
      <i class="bi bi-cash-coin me-2"></i>Vehículos en Venta
    </h4>

    <div class="row g-4 justify-content-center">
      <div
        class="col-lg-3 col-md-6 col-sm-12 card-col"
        v-for="(auto, index) in vehiculos"
        :key="auto.matricula"
      >
        <div class="card h-100 border-0 shadow bg-white text-dark">
          <img
            :src="urlImagen(auto.imagen)"
            class="card-img-top rounded-top"
            alt="Imagen del vehículo"
            style="object-fit: cover; height: 180px"
          />
          <div class="card-body">
            <h5 class="card-title fw-bold text-primary">
              {{ auto.marca }} {{ auto.modelo }}
            </h5>
            <p class="card-text mb-1 text-black">
              <strong>Año:</strong> {{ auto.anio }}
            </p>
            <p class="card-text mb-1 text-black">
              <strong>Kilómetros:</strong>
              {{ Number(auto.kilometros || 0).toLocaleString() }} km
            </p>
            <p class="card-text mb-1 text-black">
              <strong>Precio:</strong>
              {{ Number(auto.precio || 0).toLocaleString() }} €
            </p>
          </div>
          <div class="card-footer text-center bg-light">
            <button
              class="btn btn-sm"
              :class="
                auto.estado === 'vendido'
                  ? 'btn-primary disabled'
                  : 'btn-primary'
              "
              @click.stop="agregarACesta(auto)"
            >
              <i class="bi bi-cart"></i>
              {{ auto.estado.toUpperCase() }}
            </button>
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

const cestaStore = useCestaStore();

function agregarACesta(vehiculo) {
  cestaStore.addProducto({
    id: vehiculo._id,
    nombre: `${vehiculo.marca} ${vehiculo.modelo}`,
    precio: vehiculo.precio,
    imagen: urlImagen(vehiculo.imagen),
  });
}

const vehiculos = ref([]);

onMounted(async () => {
  vehiculos.value = await getArticulos();
});

function urlImagen(ruta) {
  if (!ruta) return;
  return `http://localhost:5000${ruta}`;
}
</script>
<style scoped>
.card-col:first-child {
  margin-left: 0.5rem;
}

.card-col:last-child {
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .card-col:first-child,
  .card-col:last-child {
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
