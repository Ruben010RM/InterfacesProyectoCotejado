// server/articulosRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import Articulo from "./models/Articulo.js";
import { fileURLToPath } from "url";
import fs from "fs";
import { verificarToken, soloAdmin } from "./authController.js";

// inicializar configuración de multer para manejo de archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurarse de que la carpeta uploads exista
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Carpeta uploads creada automáticamente");
}

// Crear el router
const router = express.Router();
console.log("Router articulos cargado"); // para depurar

// Configuración de almacenamiento de multer en la carpeta uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //el callback es la respuesta que da el multer al mandar la ruta, si es correcto en este caso devuelve null
    cb(null, path.join(__dirname, "uploads")); // ruta absoluta a server/uploads
  },
  filename: (req, file, cb) => {
    //el callback es la respuesta que da el multer al mandar el archivo, si es correcto en este caso devuelve null
    cb(null, Date.now() + path.extname(file.originalname)); //El nombre del archivo será la fecha actual completa y mantendrá la extensión del archivo que reviba
  },
});

// Inicializar multer
const upload = multer({ storage: storage });

// AHORA VIENEN LAS RUTAS USANDO EL router DE EXPRESS
// Obtener todos los artículo
router.get("/", async (req, res) => {
  const articulos = await Articulo.find();
  res.json(articulos);
});

// Esto recibe los datos del post de la api al enviar datos a localhost 5000 api articulos(asociado en el server), y se encarga de almacenar la imagen en uploads y en subirlo a mongodb
router.post(
  "/",
  verificarToken,
  soloAdmin,
  upload.single("imagen"),
  async (req, res) => {
    try {
      if (!req.body.vehiculo) {
        console.error("No se recibió el campo 'vehiculo'");
        return res.status(400).json({ error: "Campo 'vehiculo' vacío" });
      }

      let datos;
      try {
        //Datos coge la estructura json con los datos del body
        datos = JSON.parse(req.body.vehiculo);
      } catch (e) {
        console.error("Error parseando JSON:", e.message);
        return res
          .status(400)
          .json({ error: "JSON inválido en 'vehiculo'", detalle: e.message });
      }

      if (req.file) {
        //El filename es el descrito cuando hacemos el storage y marcamos el filename
        //Aqui añadimos un atributo mas al json datos con el nombre imagen y el valor dado
        datos.imagen = `/uploads/${req.file.filename}`;
      }

      const articulo = new Articulo(datos);
      const guardado = await articulo.save();
      res.json(guardado);
    } catch (err) {
      console.error("Error guardando artículo:", err);
      res.status(500).json({ error: err.message, stack: err.stack });
    }
  },
);

router.get("/buscar", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const regex = new RegExp(q, "i"); // 'i' para case-insensitive

  try {
    const articulos = await Articulo.find({
      $or: [{ marca: regex }, { modelo: regex }, { descripcion: regex }],
    });
    res.json(articulos);
  } catch (err) {
    res.status(500).json({ error: "Error en la búsqueda" });
  }
});
// otras rutas PUT, DELETE, GET /:id igual

export default router;
