// backend/initDefaultUser.js
import { User } from './models/User.js';
import { Role } from './models/Role.js';
import bcrypt from 'bcrypt';

export const initDefaultUser = async () => {
  try {
    const existingUser = await User.findOne({ where: { email: 'admin@example.com' } });

    if (existingUser) {
      console.log('ℹ️ Usuario ADMIN ya existe, no se creó uno nuevo.');
      return;
    }

    const adminRole = await Role.findOne({ where: { nombre: 'ADMIN' } });
    if (!adminRole) {
      console.error('❌ No se encontró el rol ADMIN. Inserta los roles primero.');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: adminRole.id,
    });

    console.log('✅ Usuario ADMIN creado correctamente.');
  } catch (error) {
    console.error('❌ Error al crear usuario default:', error);
  }
};
