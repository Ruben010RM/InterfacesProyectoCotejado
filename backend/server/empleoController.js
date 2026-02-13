import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Carpeta uploads creada automáticamente");
}

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `postulacion-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

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

router.post(
  "/upload",
  upload.fields([
    { name: "cv", maxCount: 1 },
    { name: "foto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
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

      // Guardar en JSON Server
      await fetch("http://localhost:3000/postulaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postulacion),
      });

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
