// routes/authRoutes.js

const express = require('express');
const router = express.Router();

// Importar controladores de autenticación
const {
  loginUser,
  registerUser,
  logoutUser,
  refreshToken
} = require('../controllers/authController');

// Prefijo base: /api/auth

// Ruta para iniciar sesión
router.post('/login', loginUser);

// Ruta para registrar nuevo usuario
router.post('/register', registerUser);

// Ruta para cerrar sesión
router.post('/logout', logoutUser);

// Ruta para refrescar token de acceso
router.post('/refresh-token', refreshToken);

module.exports = router;
