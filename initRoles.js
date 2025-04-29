// backend/initRoles.js
import { Role } from './models/Role.js';

export const initRoles = async () => {
  try {
    const count = await Role.count();
    if (count === 0) {
      await Role.bulkCreate([
        { nombre: 'ADMIN', descripcion: 'TODO' },
        { nombre: 'CREADOR', descripcion: 'PUEDE CREAR Y COLABORAR' },
        { nombre: 'COLABORADOR', descripcion: 'PUEDE COLABORAR (mediante URL)' },
      ], { ignoreDuplicates: true });

      console.log('✅ Roles insertados automáticamente.');
    } else {
      console.log('ℹ️ Roles ya existentes, no se insertaron duplicados.');
    }
  } catch (error) {
    console.error('❌ Error al insertar roles:', error);
  }
};
