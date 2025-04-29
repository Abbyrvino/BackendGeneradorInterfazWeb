// backend/middleware/isAdmin.js

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  if (req.user.id === 1) {
    return next(); // Usuario es el administrador
  }

  return res.status(403).json({ message: 'Acceso denegado: solo el administrador puede acceder.' });
};
