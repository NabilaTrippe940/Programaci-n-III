//Src/Middlewares/Roles.js
export const permit = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, mensaje: "Usuario no autenticado" });
    }
    const tipoUsuario = Number(req.user.tipo_usuario);
    if (rolesPermitidos.includes(tipoUsuario)) {
      return next();
    }
    return res.status(403).json({ ok: false, mensaje: "Acceso denegado: rol no permitido" });
  };
};