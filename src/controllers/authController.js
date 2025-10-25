// src/controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const levels = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

const logger = (level, msg, data = null) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${level}] ${timestamp} - [authController] ${msg}`;
  if (level === levels.ERROR) {
    console.error(logMsg, data || '');
  } else if (level === levels.WARN) {
    console.warn(logMsg, data || '');
  } else {
    console.log(logMsg, data || '');
  }
};

// Simulación básica de base de datos de usuarios (reemplaza con DB real)
const usersDB = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('supersecure', 10), // hash de password
  },
];

// Clave secreta para JWT (poner en .env)
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

// Tiempo de expiración del token
const JWT_EXPIRES_IN = '1h';

// Valida credenciales y genera token
export async function login(req, res) {
  const { username, password } = req.body;

  logger(levels.INFO, `Intento de login usuario: ${username}`);

  if (!username || !password) {
    const msg = 'Faltan campos: username y password son requeridos.';
    logger(levels.WARN, msg);
    return res.status(400).json({ success: false, error: msg });
  }

  try {
    const user = usersDB.find((u) => u.username === username);
    if (!user) {
      logger(levels.WARN, `Usuario no encontrado: ${username}`);
      return res.status(401).json({ success: false, error: 'Credenciales inválidas.' });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      logger(levels.WARN, `Password inválido para usuario: ${username}`);
      return res.status(401).json({ success: false, error: 'Credenciales inválidas.' });
    }

    const payload = { userId: user.id, username: user.username };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    logger(levels.INFO, `Login exitoso para usuario: ${username}`);

    return res.json({ success: true, token, expiresIn: JWT_EXPIRES_IN });
  } catch (error) {
    logger(levels.ERROR, 'Error en login:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
  }
}

// Middleware para validar token y proteger rutas
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger(levels.WARN, 'Token no proporcionado en petición protegida.');
    return res.status(401).json({ success: false, error: 'Token requerido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger(levels.WARN, 'Token inválido o expirado.');
      return res.status(403).json({ success: false, error: 'Token inválido o expirado.' });
    }

    req.user = user;
    next();
  });
}
