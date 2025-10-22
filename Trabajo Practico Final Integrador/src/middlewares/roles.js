//Src/Middlewares/Roles.js
export const permit = (...rolesAllowed) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, msg: "No autenticado" });
    if (rolesAllowed.includes(req.user.tipo_usuario)) return next();
    return res.status(403).json({ ok: false, msg: "Acceso denegado" });
  };
};