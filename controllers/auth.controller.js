import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '../models/User.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Verificar si ya existe el email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado.' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Buscar usuario
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  
      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });
  
      // Generar token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
      );
  
      // Respuesta con token
      res.status(200).json({
        message: 'Login exitoso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
  };