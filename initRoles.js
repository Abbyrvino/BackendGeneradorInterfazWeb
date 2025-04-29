// backend/initRoles.js
import { sequelize } from './config/db.js';
import { Role } from './models/Role.js';

const initRoles = async () => {
  try {
    await sequelize.sync(); // asegura que las tablas estén sincronizadas

    await Role.bulkCreate([
      { nombre: 'ADMIN', descripcion: 'TODO' },
      { nombre: 'CREADOR', descripcion: 'PUEDE CREAR Y COLABORAR' },
      { nombre: 'COLABORADOR', descripcion: 'PUEDE COLABORAR (mediante URL)' },
    ], { ignoreDuplicates: true });

    console.log('✅ Roles insertados correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al insertar roles:', error);
    process.exit(1);
  }
};

initRoles();
