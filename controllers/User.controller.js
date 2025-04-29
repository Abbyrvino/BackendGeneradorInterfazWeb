import { User } from '../models/User.js';

export const listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'], 
      order: [['id', 'ASC']], 
    });

    res.status(200).json({
      ok: true,
      users,
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({
      ok: false,
      message: 'Error al obtener los usuarios',
    });
  }
};
