import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

//Ruta absoluta del fichero actual convertida a path legible para windows
const __filename = fileURLToPath(import.meta.url);
//Ruta absoluta de la carpeta en base al fichero de arriba
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

// a diferencia de json-server, aquí necesita configurar las rutas y controladores manualmente
// json-server crea automáticamente las rutas basadas en el archivo JSON, mongoose requiere definir esquemas y modelos
// MONGOSEE NO SABE NADA DE RUTAS CONTROLADRES Y MODELOS, HAY QUE CREARLOS MANUALMENTE

import articulosRoutes from "./articulosRoutes.js"; // ruta al router backend
import authController from "./authController.js";
import contactoRouter from "./contactoRouter.js";
import facturaRoutes from "./facturaRoutes.js";
import Stripe from "stripe";
import { log } from "console";
const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from environment or default to 5000

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware
// app.use(cors()); si no funciona lo siguiente
app.use(cors());

app.use(express.json());

// Rutas DE MONGOOSE, JSON SERVER NO ES NECESARIO LAS RUTAS LAS CREA AUTOMATICAMENTE
// json-server es un backend ya construido.
// Express es un backend que TÚ construyes.
// Por eso json-server no requiere rutas y Express sí.
app.use("/api/articulos", articulosRoutes);

app.use("/api/facturas", facturaRoutes);

app.use("/api/auth", authController);
// Verificar variable
//console.log("MONGODB_URI =", process.env.MONGODB_URI);

/// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB a la base de datos BBDD"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

//Iniciar el servidor Express en el puerto especificado
app.listen(PORT, () => {
  console.log(`Server Express está corriendo en el puerto: ${PORT}`);
});

app.use("/api/contacto", contactoRouter);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/crear-checkout-session", async (req, res) => {
  //Como stripe recibe una linea de objetos y quiero q se muestre cada item y no solo el precio final
  //me mando en la peticion tanto los precios totales, como si tiene envio o no.
  //En base  a los dos precios, con descuento y el base, calculo el factor de descuento y lo aplico si eexiste
  //Al precio de cada item
  try {
    const { items, precioFinal, totalPrecio, envioGratis } = req.body;

    const tieneDescuento = precioFinal < totalPrecio;
    const factorDescuento = tieneDescuento ? precioFinal / totalPrecio : 1;
    const lineaItems = items.map((item) => {
      const precioConDescuento = item.precio * factorDescuento;

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name:
              item.nombre +
              (tieneDescuento
                ? ` (descuento de ${Math.round((1 - factorDescuento) * 100)}% )`
                : ""),
          },
          unit_amount: Math.round(precioConDescuento * 100),
        },
        quantity: item.cantidad,
      };
    });

    // ENVÍO como línea separada
    if (!envioGratis) {
      lineaItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Gastos de envío" },
          unit_amount: 5000, // 50€
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineaItems,
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({ error: "Error interno" });
  }
});
