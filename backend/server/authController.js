import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import express from "express";

//Creamos el routing para que sirva en el server con app.use
const router = express.Router();

//funcion que se llamara y obtendra los datos enviados por authApi
export async function login(req, res) {
  const { dni, password } = req.body;
  try {
    //Buscar usuario en JSON-Server
    const response = await axios.get(
      `http://localhost:3000/clientes?dni=${dni}`,
    );
    const user = response.data[0];

    //Compara las contraseñas hasheando la que pasamos por parametro
    if (!user)
      return res.status(400).json({ message: "Usuario no encontrado" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res
        .status(400)
        .json({ message: "Usuario o Contraseña incorrecto" });

    //Genera un token con los datos del DNI y el tipo de Usuario que es
    const token = jwt.sign(
      {
        dni: user.dni,
        tipo: user.tipo || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );
    //Devuelve como datos al usarlo, tanto el token, como el tipo como el nombre del usuario buscado con la peticion axios a el json-server
    res.json({
      token,
      nombre: user.nombre,
      tipo: user.tipo || "user",
    });
  } catch (error) {
    console.error(error);
  }
}

// Middleware: verificar JWT
// Se usa en rutas que requieren autenticación
// Verifica el token enviado en el header Authorization

export function verificarToken(req, res, next) {
  //Mandamos el token en la peticion http y lo almacenamoos aqui
  console.log("🔍 Middleware verificarToken ejecutándose...");
  console.log("Headers recibidos:", req.headers);

  const authHeader = req.headers.authorization;
  console.log("Authorization header:", authHeader);
  //Si no existe mensaje de error
  if (!authHeader) {
    console.log("ERROR: Token no recibido - 401");
    return res.status(401).json({ mensaje: "Token no recibido" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extraído:", token ? "SÍ" : "NO");
  //Si existe se verifica que sea valido y vemos los datos que contiene
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token válido. Usuario:", decoded);
    //Se crea un atributo user para el request de la peticion que seguira hacia delante(soloAdmin), con los datos del usuario
    req.user = decoded;
    //Se ejecuta la siguiente funcion que toque
    next();
  } catch (err) {
    console.log(" ERROR: Token inválido - 403", err.message);
    return res.status(403).json({ mensaje: "Token inválido" });
  }
}

/// TAMBIEN EN EL FICHERO APARTE authMiddleware.js
// Middleware: solo admin
export function soloAdmin(req, res, next) {
  //Como venimos de verificar token, tenemos en el Request el atributo user, y accedemos unicamente al tipo
  if (req.user?.tipo !== "admin") {
    return res
      .status(403)
      .json({ mensaje: "Acceso solo para administradores" });
  }
  //Ejecutamos siguiente funcion si es necesario
  next();
}

router.post("/login", login);
router.get("/check-admin", verificarToken, soloAdmin, (req, res) => {
  res.json({ admin: req.user?.tipo === "admin" });
});

router.get("/modelos", verificarToken, soloAdmin, (req, res) => {
  console.log("Esto va a devolver todos los modelos de la BBDD");
});

//Seccion que se encarga de verificar que las peticiones hechas desde el frontend a clientes son de usuarios registrados y admins
//Solo get, ya que quieres permitirle a los usuarios el cambiar sus datos
const JSON_SERVER_URL_CLI = "http://localhost:3000/clientes";
export async function handlerClientesGet(req, res) {
  try {
    const { historico, _sort = "apellidos", _order = "asc" } = req.query;

    // Construir la URL hacia JSON Server
    let url = `${JSON_SERVER_URL_CLI}?_sort=${_sort}&_order=${_order}`;
    if (historico !== undefined) {
      url += `&historico=${historico}`;
    }
    console.log("Devolviendo datos");
    const respuesta = await axios.get(url);
    return res.json(respuesta.data);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo clientes" });
  }
}
router.get("/clientes", verificarToken, soloAdmin, handlerClientesGet);

//Seccion que se encarga de verificar que las peticiones hechas desde el frontend a taller son de usuarios registrados y admins
const JSON_SERVER_URL_TALLER = "http://localhost:3000/taller";
export async function handlerCitasTallerGet(req, res) {
  try {
    const respuesta = await axios.get(JSON_SERVER_URL_TALLER);
    console.log("Devolviendo citas");
    return res.json(respuesta.data);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: "Error obteniendo citas" });
  }
}
export async function handlerCitasTallerPost(req, res) {
  try {
    const respuesta = await axios.post(JSON_SERVER_URL_TALLER, req.body);
    console.log("Creando citas");
    return res.json(respuesta.data);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: "Error creando citas" });
  }
}

export async function handlerCitasTallerDelete(req, res) {
  try {
    const { id } = req.params;
    const respuesta = await axios.delete(JSON_SERVER_URL_TALLER + "/" + id);
    return res.json(respuesta.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al borrar la cita" });
  }
}

export async function handlerCitasTallerUpdate(req, res) {
  try {
    const { id } = req.params;
    const resultado = await axios.put(
      JSON_SERVER_URL_TALLER + "/" + id,
      req.body,
    );
    console.log("Actualizando noticia");
    return res.json(resultado.data);
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({ error: "Error al editar la cita" });
  }
}

router.get("/taller", verificarToken, soloAdmin, handlerCitasTallerGet);
router.post("/taller", verificarToken, soloAdmin, handlerCitasTallerPost);
router.delete(
  "/taller/:id",
  verificarToken,
  soloAdmin,
  handlerCitasTallerDelete,
);
router.put("/taller/:id", verificarToken, soloAdmin, handlerCitasTallerUpdate);
//Lo mismo con notcias, que oslo pueda crear y borrar admin y si el token es correcto
const JSON_SERVER_URL_NOTICIAS = "http://localhost:3000/noticias";
export async function handlerNoticiasPost(req, res) {
  try {
    const respuesta = await axios.post(JSON_SERVER_URL_NOTICIAS, req.body);
    console.log("Noticia creada");
    return res.json(respuesta.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al agregar la noticia" });
  }
}

export async function handlerNoticiasDelete(req, res) {
  try {
    const { id } = req.params;
    const respuesta = await axios.delete(JSON_SERVER_URL_NOTICIAS + "/" + id);
    return res.json(respuesta.data);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la noticia" });
  }
}

router.post("/noticias", verificarToken, soloAdmin, handlerNoticiasPost);
router.delete(
  "/noticias/:id",
  verificarToken,
  soloAdmin,
  handlerNoticiasDelete,
);
//Hay que exportar el router para ser detectado por el express en el server
export default router;
