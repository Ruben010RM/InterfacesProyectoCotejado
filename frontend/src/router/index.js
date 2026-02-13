import NotFound from "../components/NotFound.vue";
import PaginaInicio from "../components/PaginaInicio.vue";
import GestionClientes from "../components/GestionClientes.vue";
import NotiCias from "../components/NotiCias.vue";
import AvisoLegal from "../components/AvisoLegal.vue";
import PoliticaPrivacidad from "../components/PoliticaPrivacidad.vue";
import MoDelos from "../components/MoDelos.vue";
import VenTas from "../components/VenTas.vue";
import CitasTaller from "../components/CitasTaller.vue";
import BusCar from "../components/BusCar.vue";
import { createRouter, createWebHistory } from "vue-router";
import TablaLogin from "../components/TablaLogin.vue";
import { esAdmin } from "../api/authApi";
import ConTacto from "../components/ConTacto.vue";
import CesTa from "../components/CesTa.vue";
import TablaSuccess from "../components/TablaSuccess.vue";
import TablaCancel from "../components/TablaCancel.vue";
import CarDetails from "../components/CarDetails.vue";
import ReservarVehiculo from "../components/ReservarVehiculo.vue";
import EmpLeo from "../components/EmpLeo.vue";
const routes = [
  {
    path: "/",
    name: "Inicio",
    component: PaginaInicio,
  },
  {
    path: "/clientes",
    name: "GestionClientes",
    component: GestionClientes,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
  {
    path: "/noticias",
    name: "NotiCias",
    component: NotiCias,
  },
  {
    path: "/avisolegal",
    name: "AvisoLegal",
    component: AvisoLegal,
  },
  {
    path: "/politicaprivacidad",
    name: "PoliticaPrivacidad",
    component: PoliticaPrivacidad,
  },
  {
    path: "/modelos",
    name: "MoDelos",
    component: MoDelos,
    meta: { requiresAdmin: true },
  },
  {
    path: "/ventas",
    name: "VenTas",
    component: VenTas,
  },
  {
    path: "/citas-taller",
    name: "CitasTaller",
    component: CitasTaller,
    meta: { requiresAdmin: true },
  },
  {
    path: "/login",
    name: "TablaLogin",
    component: TablaLogin,
  },
  {
    path: "/contacto",
    name: "ConTacto",
    component: ConTacto,
  },
  {
    path: "/buscar",
    name: "BusCar",
    component: BusCar,
  },
  {
    path: "/cesta",
    name: "CesTa",
    component: CesTa,
  },
  {
    path: "/success",
    name: "TablaSuccess",
    component: TablaSuccess,
  },
  {
    path: "/cancel",
    name: "TablaCancel",
    component: TablaCancel,
  },
  {
    path: "/cardetails/:id",
    name: "CarDetails",
    component: CarDetails,
  },
  {
    path: "/reservar/:id",
    name: "ReservarVehiculo",
    component: ReservarVehiculo,
  },
  {
    path: "/empleo",
    name: "EmpLeo",
    component: EmpLeo,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach(async (to, from, next) => {
  const token = sessionStorage.getItem("token");

  // Si la ruta requiere ser admin
  if (to.meta.requiresAdmin) {
    // Si no hay token → al login
    if (!token) return next({ name: "TablaLogin" });

    // Consultar al backend si es admin
    const admin = await esAdmin();

    if (!admin) {
      return next({ name: "Inicio" }); // acceso denegado
    }
  }

  next();
});

export default router;
