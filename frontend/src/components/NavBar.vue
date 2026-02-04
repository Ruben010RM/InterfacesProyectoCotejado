<template>
  <nav class="navbar navbar-dark bg-primary sticky-top navbar-expand-lg">
    <div class="container-fluid">
      <!-- Marca o logo -->
      <a class="navbar-brand d-flex align-items-center" href="/">
        <img src="/src/assets/logo.svg" style="height: 30px" />
      </a>
      <!-- Botón de hamburguesa en pantallas pequeñas -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Links de navegación -->
      <div
        class="collapse navbar-collapse justify-content-center"
        id="navbarNav"
      >
        <ul class="navbar-nav d-flex justify-content-center w-80">
          <li class="nav-item">
            <router-link to="/" class="nav-link">Inicio</router-link>
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link to="/clientes" class="nav-link">Clientes</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/noticias" class="nav-link">Noticias</router-link>
          </li>

          <li class="nav-item">
            <router-link to="/ventas" class="nav-link">Ventas</router-link>
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link to="/modelos" class="nav-link">Modelos</router-link>
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link to="/citas-taller" class="nav-link"
              >Taller</router-link
            >
          </li>
          <li class="nav-item">
            <router-link to="/contacto" class="nav-link">Contacto</router-link>
          </li>
        </ul>
      </div>
      <p
        class="d-flex justify-content-center align-items-center text-white m-0 me-2"
      >
        {{ userName }}
      </p>

      <form class="d-flex ms-auto me-2" role="search" @submit.prevent="buscar">
        <input
          class="form-control form-control-sm me-2 rounded"
          type="search"
          placeholder="Buscar..."
          aria-label="Buscar"
          v-model="query"
          style="width: 140px"
        />
        <button class="btn btn-light btn-sm rounded" type="submit">
          <i class="bi bi-search"></i>
        </button>
      </form>
      <router-link
        to="/cesta"
        class="btn btn-primary position-relative ms-3 me-2"
        title="Cesta"
      >
        <i class="bi bi-cart3 fs-4"></i>
        <span
          class="position-absolute top-0 start-100 translate-middle badge rounden-pill bg-danger"
          v-if="cesta.totalItems > 0"
          >{{ cesta.totalItems }}</span
        >
      </router-link>

      <!-- Dropdown de acceso/registro -->
      <div class="dropdown">
        <button
          class="btn btn-primary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="bi bi-person fs-4"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <!-- Mostra “Acceso/Registro” se NON hai usuario logueado -->
          <li v-if="!isLogueado">
            <router-link class="dropdown-item" to="/login">Acceso</router-link>
          </li>
          <li v-if="!isLogueado">
            <router-link class="dropdown-item" to="/clientes"
              >Registro</router-link
            >
          </li>
          <!-- Mostra “Cerrar Sesión” se está logueado -->
          <li v-if="isLogueado && isUsuario">
            <router-link class="dropdown-item" to="/clientes"
              >Perfil</router-link
            >
          </li>
          <li v-if="isLogueado">
            <a class="dropdown-item" href="#" @click.prevent="logout"
              >Cerrar Sesión</a
            >
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { esAdmin } from "../api/authApi"; // importamos la función que ya tenemos
import { useRouter } from "vue-router";
import { useCestaStore } from "../store/cesta";

const cesta = useCestaStore();
const query = ref("");
const isLogueado = ref(false);
const isAdmin = ref(false);
const isUsuario = ref(false);
const userName = ref("");

const router = useRouter();

function buscar() {
  if (query.value.trim() !== "") {
    router.push({ name: "BusCar", query: { q: query.value.trim() } });
    query.value = "";
  }
}

// Se ejecuta al montar el componente
onMounted(async () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    isLogueado.value = false;
    isAdmin.value = await esAdmin();
    isUsuario.value = false;
    userName.value = "";
    return;
  }

  try {
    // Decidir si es admin usando la función del frontend
    isAdmin.value = await esAdmin();
    isUsuario.value = !isAdmin.value;
    isLogueado.value = true;
    userName.value = sessionStorage.getItem("userName") || "";
  } catch (err) {
    sessionStorage.clear();
    isLogueado.value = false;
    isAdmin.value = false;
    isUsuario.value = false;
    userName.value = "";
  }
});

// Logout
function logout() {
  sessionStorage.clear();
  isLogueado.value = false;
  isAdmin.value = false;
  isUsuario.value = false;
  userName.value = "";
  window.location.href = "/";
}
</script>

<style>
.navbar-dark .nav-link {
  color: rgba(255, 255, 255, 0.9); /* blanco suave */
}
p {
  color: rgba(255, 255, 255, 0.9); /* blanco suave */
}

.navbar-dark .nav-link:hover,
.navbar-dark .nav-link:focus {
  color: #fff; /* blanco intenso al pasar el ratón */
}
</style>
