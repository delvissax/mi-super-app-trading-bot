// routes/userRoutes.js

const express = require('express');
const router = express.Router();

// Importar controladores de usuario
const {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  listUsers,
  getUserSettings,
  updateUserSettings
} = require('../controllers/userController');

// Prefijo base: /api/user

// Obtener perfil de usuario por ID
router.get('/:userId/profile', getUserProfile);

// Actualizar perfil de usuario por ID
router.put('/:userId/profile', updateUserProfile);

// Eliminar cuenta de usuario por ID
router.delete('/:userId', deleteUserAccount);

// Listar todos los usuarios (con paginación y filtros)
router.get('/', listUsers);

// Obtener configuración personalizada del usuario
router.get('/:userId/settings', getUserSettings);

// Actualizar configuración personalizada del usuario
router.put('/:userId/settings', updateUserSettings);

module.exports = router;

