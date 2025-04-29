import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// 1. Configuración inicial
dotenv.config();

// 2. Validación de variables críticas
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT'];
requiredEnvVars.forEach(env => {
  if (!process.env[env]) {
    throw new Error(`❌ Variable de entorno faltante: ${env}`);
  }
});

// 3. Configuración avanzada de Sequelize
export const sequelize = new Sequelize(
  process.env.DB_NAME,     // Nombre de la base de datos
  process.env.DB_USER,     // Usuario
  process.env.DB_PASSWORD, // Contraseña
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT), // Aseguramos que sea número
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 5,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      evict: parseInt(process.env.DB_POOL_EVICT) || 1000
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false // Para desarrollo con SSL autofirmado
      } : false
    },
    define: {
      timestamps: true,     // createdAt y updatedAt automáticos
      underscored: true,    // snake_case en lugar de camelCase
      freezeTableName: true // Evita pluralización automática
    }
  }
);

// 4. Función de prueba de conexión (opcional)
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error);
    return false;
  }
};

// 5. Ejecutar prueba al cargar (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  testConnection();
}