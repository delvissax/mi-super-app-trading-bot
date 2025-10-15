// utils.js - modo PRO ultra MAX

const crypto = require('crypto');

// Logger util configurable
const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
};

// Generador de IDs únicos (UUID v4)
const generateUUID = () => {
  return crypto.randomUUID();
};

// Validación básica de email usando regex robusta
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Helper para formatear fechas a ISO legible truncando milisegundos
const formatDate = (date = new Date()) => {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

// Función para manejar promesas con try/catch y devolver [error, data]
const to = async (promise) => {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [error, undefined];
  }
};

// Helper para tiempo de espera asíncrono (sleep)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Conversión segura a número con fallback y log
const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  if (Number.isNaN(n)) {
    logger.warn(`toNumber: valor inválido "${value}", usando fallback ${fallback}`);
    return fallback;
  }
  return n;
};

module.exports = {
  logger,
  generateUUID,
  isValidEmail,
  formatDate,
  to,
  sleep,
  toNumber,
};
