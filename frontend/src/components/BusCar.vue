<template>
  <div class="container mt-4">
    <h5 class="text-center bg-primary-subtle ms-1 py-1">
      <i class="bi bi-search me-2"></i>
    </h5>

    <div v-if="clientes.length">
      <h6 class="fw-bold">Clientes</h6>
      <ul>
        <li v-for="c in clientes" :key="c.id">
          {{ c.nombre }}
          <span v-html="resaltar(c.appellidos, termino)"></span>
          -
          <small class="text-muted" v-html="resaltar(c.email, termino)"></small>
        </li>
      </ul>
    </div>
    <div v-if="noticias.length" class="mt-4">
      <h6 class="fw-bold">Noticias</h6>
      <ul>
        <li v-for="n in noticias" :key="n.id">
          {{ n.nombre }}
          <span v-html="resaltar(n.titulo, termino)"></span>
        </li>
      </ul>
    </div>

    <div v-if="articulos.length" class="mt-4">
      <h6 class="fw-bold">Artículos</h6>
      <ul>
        <li v-for="a in articulos" :key="a.id">
          <span v-html="resaltar(a.marca + ' ' + a.modelo, termino)"></span>
          - <small v-html="resaltar(a.descripcion, termino)"></small>
        </li>
      </ul>
    </div>
    <div
      v-if="!clientes.length && !noticias.length && !articulos.length"
      class="mt-3"
    >
      <p class="text-dark">No se encontraron resultados.</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const termino = ref(route.query.q?.toLowerCase() || "");

const clientes = ref([]);
const noticias = ref([]);
const articulos = ref([]);

async function buscar() {
  const q = termino.value.trim().toLowerCase();
  if (!q) {
    clientes.value = [];
    noticias.value = [];
    articulos.value = [];
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/articulos/buscar?q=${encodeURIComponent(q)}`,
    );
    if (res.ok) {
      articulos.value = await res.json();
    }
  } catch (error) {
    console.warn("MongoDB artículos no disponible", error);
  }

  const resClientes = await fetch("http://localhost:3000/clientes");
  const resNoticias = await fetch("http://localhost:3000/noticias");

  const listaClientes = await resClientes.json();
  const listaNoticias = await resNoticias.json();

  clientes.value = listaClientes.filter(
    (c) =>
      (c.nombre && c.nombre.toLowerCase().includes(q)) ||
      (c.appellidos && c.appellidos.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)),
  );
  noticias.value = listaNoticias.filter(
    (n) => n.titulo && n.titulo.toLowerCase().includes(q),
  );
}

onMounted(() => {
  termino.value = route.query.q?.toLowerCase() || "";
  if (termino.value) {
    buscar();
  }
});

watch(
  () => route.query.q,
  (nuevo) => {
    termino.value = nuevo.toLowerCase();
    buscar();
  },
);

function resaltar(texto, termino) {
  if (!texto) return "";
  const regex = new RegExp(`(${termino})`, "gi");
  return texto.replace(regex, "<mark>$1</mark>");
}
</script>
<style scoped></style>
