// models/Role.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'roles',
  timestamps: false,
});
