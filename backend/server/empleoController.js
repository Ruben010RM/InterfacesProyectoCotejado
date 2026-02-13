import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Vemos si existe la carpeta uploads y si no se crea
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Carpeta uploads creada automáticamente");
}

const router = express.Router();
//seteamos en multer el destino a la carpeta de uploadsDir y el nombre del fichero que guarde sera el que pongamos en uniquename
//hay que devolver ese nombre y el destinoo en los callbacks
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `postulacion-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

//En la funcion de upload de multer decimos el storage(ruta destino y nombre + extenson del fichero), tamaños permitidos
//y que tipo de archivos permitimos, si cumple la condicion se deja(acceptFile = true ) subir, si no no
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf" ||
      file.mimetype.includes("word")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Solo PDF, Word o imágenes"), false);
    }
  },
});

//En el post indicamos que primero se verifiquen los archivos y se setee el destin + nombre nuevo, indicamos que archivos tendremos y a que campos del body corresponden
//Aqui multer ya se encarga de almacenar el archivo si pasa los filtros y las comprobaciones
router.post(
  "/upload",
  upload.fields([
    { name: "cv", maxCount: 1 },
    { name: "foto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      //Creamos objeto con los datos del body para guardar en el json, de las imagenes y archivos solo almacenamos rutas
      const postulacion = {
        id: Date.now(),
        nombre: req.body.nombre,
        telefono: req.body.telefono,
        email: req.body.email,
        puesto: req.body.puesto,
        experiencia: req.body.experiencia,
        mensaje: req.body.mensaje || "",
        cvRuta: req.files.cv ? `/uploads/${req.files.cv[0].filename}` : null,
        fotoRuta: req.files.foto
          ? `/uploads/${req.files.foto[0].filename}`
          : null,
        fecha: new Date().toISOString(),
      };

      // Guardar en JSON Server la postulacion con las rutas
      await fetch("http://localhost:3000/postulaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postulacion),
      });

      //Devolvemos un successs
      res.json({
        success: true,
        message: "Postulación guardada",
        cvRuta: postulacion.cvRuta,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

export default router;
