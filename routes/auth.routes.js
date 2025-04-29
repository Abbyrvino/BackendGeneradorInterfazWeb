import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { listUsers } from '../controllers/User.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', register);

// Ruta para iniciar sesión y obtener un token JWT
router.post('/login', login);

// Ruta protegida: solo accesible por el administrador (ID 5)
router.get('/usuarios', authenticate, isAdmin, listUsers);

export default router;
