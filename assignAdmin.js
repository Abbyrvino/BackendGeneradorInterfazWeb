// backend/assignAdmin.js
import { sequelize } from './config/db.js';
import { User, Role } from './models/index.js';

const assignAdminRole = async () => {
  try {
    await sequelize.authenticate();

    // Buscar el rol ADMIN
    const adminRole = await Role.findOne({ where: { nombre: 'ADMIN' } });

    if (!adminRole) {
      console.error('❌ No se encontró el rol ADMIN en la base de datos.');
      process.exit(1);
    }

    // Asignar el rol al usuario con id 5
    const updated = await User.update(
      { roleId: adminRole.id },
      { where: { id: 5 } }
    );

    if (updated[0] === 0) {
      console.log('⚠️ No se encontró un usuario con ID 5.');
    } else {
      console.log('✅ Rol ADMIN asignado correctamente al usuario con ID 5.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al asignar el rol:', error);
    process.exit(1);
  }
};

assignAdminRole();
