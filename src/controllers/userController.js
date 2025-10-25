// src/controllers/userController.js
import bcrypt from 'bcryptjs';

const levels = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

const logger = (level, msg, data = null) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${level}] ${timestamp} - [userController] ${msg}`;
  if (level === levels.ERROR) {
    console.error(logMsg, data || '');
  } else if (level === levels.WARN) {
    console.warn(logMsg, data || '');
  } else {
    console.log(logMsg, data || '');
  }
};

// Simulación simple de DB usuarios (reemplazar con DB real)
const usersDB = [];

/**
 * Registrar nuevo usuario
 */
export async function registerUser(req, res) {
  const { username, email, password } = req.body;

  logger(levels.INFO, `Intento de registro usuario: ${username}`);

  if (!username || !email || !password) {
    const msg = 'Campos username, email y password son obligatorios.';
    logger(levels.WARN, msg);
    return res.status(400).json({ success: false, error: msg });
  }

  const existingUser = usersDB.find((u) => u.username === username || u.email === email);
  if (existingUser) {
    const msg = 'Usuario o email ya registrado.';
    logger(levels.WARN, msg);
    return res.status(409).json({ success: false, error: msg });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = {
      id: usersDB.length + 1,
      username,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    usersDB.push(newUser);

    logger(levels.INFO, `Usuario registrado exitosamente: ${username}`);
    return res.status(201).json({
      success: true,
      user: { id: newUser.id, username, email },
    });
  } catch (error) {
    logger(levels.ERROR, 'Error registrando usuario', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
  }
}

/**
 * Obtener perfil de usuario (simulado)
 */
export async function getUserProfile(req, res) {
  const userId = parseInt(req.params.id);

  logger(levels.INFO, `Solicitando perfil usuario id=${userId}`);

  if (isNaN(userId)) {
    const msg = 'ID de usuario inválido.';
    logger(levels.WARN, msg);
    return res.status(400).json({ success: false, error: msg });
  }

  const user = usersDB.find((u) => u.id === userId);
  if (!user) {
    const msg = 'Usuario no encontrado.';
    logger(levels.WARN, msg);
    return res.status(404).json({ success: false, error: msg });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
}

/**
 * Actualizar usuario (solo email en este ejemplo)
 */
export async function updateUserEmail(req, res) {
  const userId = parseInt(req.params.id);
  const { email } = req.body;

  logger(levels.INFO, `Intentando actualizar email usuario id=${userId}`);

  if (isNaN(userId) || !email) {
    const msg = 'ID inválido o email no proporcionado.';
    logger(levels.WARN, msg);
    return res.status(400).json({ success: false, error: msg });
  }

  const user = usersDB.find((u) => u.id === userId);
  if (!user) {
    const msg = 'Usuario no encontrado.';
    logger(levels.WARN, msg);
    return res.status(404).json({ success: false, error: msg });
  }

  user.email = email;
  logger(levels.INFO, `Email de usuario id=${userId} actualizado a ${email}`);
  return res.status(200).json({
    success: true,
    user: { id: user.id, username: user.username, email },
  });
}

/**
 * Eliminar usuario
 */
export async function deleteUser(req, res) {
  const userId = parseInt(req.params.id);

  logger(levels.INFO, `Intentando eliminar usuario id=${userId}`);

  if (isNaN(userId)) {
    const msg = 'ID de usuario inválido.';
    logger(levels.WARN, msg);
    return res.status(400).json({ success: false, error: msg });
  }

  const userIndex = usersDB.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    const msg = 'Usuario no encontrado.';
    logger(levels.WARN, msg);
    return res.status(404).json({ success: false, error: msg });
  }

  usersDB.splice(userIndex, 1);
  logger(levels.INFO, `Usuario id=${userId} eliminado exitosamente`);
  return res.status(200).json({
    success: true,
    message: 'Usuario eliminado correctamente',
  });
}
