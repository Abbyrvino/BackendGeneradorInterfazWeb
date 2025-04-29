// backend/middleware/isAdmin.js

import { User, Role } from '../models/index.js';

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const user = await User.findByPk(req.user.id, {
      include: {
        model: Role,
        attributes: ['nombre'],
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.Role.nombre === 'ADMIN') {
      return next(); // ✅ Es administrador
    }

    return res.status(403).json({ message: 'Acceso denegado: solo administradores' });
  } catch (err) {
    console.error('❌ Error en middleware isAdmin:', err);
    return res.status(500).json({ message: 'Error interno de autorización' });
  }
};
