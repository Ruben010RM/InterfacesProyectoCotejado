<template>
  <div class="container-fluid my-4 p-4 border rounded-4 bg-white">
    <h4 class="text-center mb-4 fw-semibold text-primary border-bottom pb-2">
      <i class="bi bi-cart3 me-2"></i>Mi Cesta
    </h4>

    <div v-if="cesta.totalItems <= 0">La cesta está vacía</div>

    <div v-else>
      <table class="table table-responsive">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cesta.items" :key="item.id">
            <td>{{ item.nombre }}</td>
            <td>{{ item.precio }}</td>
            <td>
              <button
                class="btn btn-sm btn-outline-secondary me-1"
                @click.stop="decrementarCantidad(item.id)"
              >
                -</button
              >{{ item.cantidad
              }}<button
                class="btn btn-sm btn-outline-secondary ms-1"
                @click.stop="incrementarCantidad(item.id)"
              >
                +
              </button>
            </td>
            <td>{{ item.precio * item.cantidad }}€</td>
            <td>
              <button
                class="btn btn-sm btn-danger"
                @click.stop="removeProducto(item.id)"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="fw-bold">
            <td colspan="3" class="text-end">Total</td>
            <td>{{ cesta.totalPrecio.toFixed(2) }}€</td>
            <td>
              <button
                class="btn btn-success btn-sm justify-content-end px-3"
                @click="iniciarPago"
                :disabled="!logueado"
              >
                Pago
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
      <span v-if="!logueado" class="mb-0 d-flex justify-content-end">
        Por favor, para proceder al pago:
        <router-link to="/login">Inicie Sesión</router-link> o
        <router-link to="/clientes">Regístrate</router-link>
      </span>
    </div>
  </div>
</template>
<script setup>
import axios from "axios";

import { useCestaStore } from "../store/cesta";
import Swal from "sweetalert2";

//Si existe el token es que estamos logueados, lo almacenamos como boolean solo
const logueado = sessionStorage.getItem("token") ? true : false;

//creamos la cesta porque vamos a usar sus datos y metodos aqui tambien
const cesta = useCestaStore();

//Funciones locales que usan las pasadas por la cesta
function incrementarCantidad(id) {
  cesta.incrementarCantidad(id);
}
function decrementarCantidad(id) {
  cesta.decrementarCantidad(id);
}
function removeProducto(id) {
  cesta.removeProducto(id);
}

//Alerta reutilizable pasandole los datos por parametro
function mostrarAlerta(title, text, icon) {
  Swal.fire({
    icon: icon,
    title: title,
    text: text,
    timer: 1500,
    showConfirmButton: false,
  });
}

//Funcion que inicializa y redirige el pago, ya sea exitoso o cancelado.
async function iniciarPago() {
  //Si la cesta no tiene items mostramos alerta
  if (!cesta.items.length) {
    mostrarAlerta("Aviso", "La cesta está vacía", "warning");
    return;
  }
  try {
    //Intentamos mandar los datos para el pago en Stripe (ver server.js)
    const response = await axios.post(
      "http://localhost:5000/crear-checkout-session",
      {
        items: cesta.items,
        amount: cesta.totalPrecio,
      },
    );
    //Almacenamos la session dada por la respuesta del server, será una url.
    const session = response.data;

    //Si no existe esta url mostramos alerta de error y cortamos ejecución
    if (!session.url) {
      console.error("No se recibió URL de Stripe");
      mostrarAlerta("Error", "No se pudo iniciar el pago", "error");
      return;
    }
    //Si existe redirigimos a la url que nos haya mandado Stripe
    window.location.href = session.url;
  } catch (error) {
    console.error("Error en iniciarPago", error);
    mostrarAlerta("Error", "No se pudo iniciar el pago", "error");
  }
}
</script>
<style scoped></style>
