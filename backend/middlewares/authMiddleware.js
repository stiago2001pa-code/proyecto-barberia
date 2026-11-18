const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      error: "Acceso denegado: cabecera Authorization no proporcionada",
    });
  }

  const partes = authHeader.split(" ");
  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      error: "Formato de token inválido. Debe ser: Bearer <token>",
    });
  }

  const token = partes[1];
  const secret = process.env.JWT_SECRET || "default_secret";

  try {
    const payload = jwt.verify(token, secret);
    req.usuario = payload;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "El token ha expirado. Por favor inicia sesión nuevamente." });
    }
    return res.status(403).json({ error: "Token inválido o corrupto." });
  }
}

function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(", ")}`,
      });
    }

    next();
  };
}

module.exports = {
  verificarToken,
  autorizarRoles,
};
