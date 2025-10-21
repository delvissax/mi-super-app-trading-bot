// src/services/capitalService.js
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getAuthHeaders } from "./capitalAuth.js";

// ===========================================================
// 🧩 CONFIGURACIÓN INICIAL Y ENV VARIABLES
// ===========================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// URLs API Capital.com
export const CAPITAL_DEMO_URL = "https://demo-api-capital.backend-capital.com";
export const CAPITAL_REAL_URL = "https://api-capital.backend-capital.com";

// ===========================================================
// 🔧 CONFIGURACIÓN GLOBAL AXIOS CON INTERCEPTORS PRO
// ===========================================================

const axiosInstance = axios.create({
  timeout: 30000,
  validateStatus: (status) => status < 500,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "TradingBot-Pro/2.0",
  },
});

// Interceptor de requests para logging automático
axiosInstance.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de responses para métricas
axiosInstance.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    response.duration = duration;
    return response;
  },
  (error) => {
    if (error.config?.metadata) {
      error.duration = Date.now() - error.config.metadata.startTime;
    }
    return Promise.reject(error);
  }
);

// ===========================================================
// 🔄 SISTEMA DE RETRY CON BACKOFF EXPONENCIAL ULTRA PRO
// ===========================================================

const axiosRetry = async (fn, retries = 3, baseDelay = 500, factor = 2) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // No reintentar en errores del cliente (4xx excepto 429)
      if (
        error.response?.status >= 400 &&
        error.response?.status < 500 &&
        error.response?.status !== 429
      ) {
        throw error;
      }

      if (attempt < retries) {
        const delay = baseDelay * Math.pow(factor, attempt);
        const jitter = Math.random() * 200; // Jitter para evitar thundering herd
        const waitTime = delay + jitter;

        logger(levels.WARN, `Reintento ${attempt + 1}/${retries} en ${Math.round(waitTime)}ms`, {
          error: error.message,
          status: error.response?.status,
        });

        await new Promise((res) => setTimeout(res, waitTime));
      }
    }
  }

  throw lastError;
};

// ===========================================================
// 🛠️ LOGGER AVANZADO CON COLORES Y NIVELES
// ===========================================================

const levels = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  DEBUG: "DEBUG",
  SUCCESS: "SUCCESS",
};

const colors = {
  INFO: "\x1b[36m", // Cyan
  WARN: "\x1b[33m", // Yellow
  ERROR: "\x1b[31m", // Red
  DEBUG: "\x1b[35m", // Magenta
  SUCCESS: "\x1b[32m", // Green
  RESET: "\x1b[0m",
};

const logger = (level, msg, data = null) => {
  const timestamp = new Date().toISOString();
  const color = colors[level] || colors.RESET;
  const logMsg = `${color}[${level}]${colors.RESET} ${timestamp} - ${msg}`;

  if (level === levels.ERROR) {
    console.error(logMsg);
    if (data) console.error("📋 Detalles:", JSON.stringify(data, null, 2));
  } else if (level === levels.WARN) {
    console.warn(logMsg);
    if (data) console.warn("⚠️  Data:", JSON.stringify(data, null, 2));
  } else if (level === levels.SUCCESS) {
    console.log(logMsg, "✅");
    if (data) console.log("📦 Data:", JSON.stringify(data, null, 2));
  } else {
    console.log(logMsg);
    if (data) console.log("📊 Data:", JSON.stringify(data, null, 2));
  }
};

// ===========================================================
// 🔑 CREDENCIALES Y VALIDACIONES ULTRA SEGURAS
// ===========================================================

const validOrderTypes = new Set(["BUY", "SELL"]);
const validModes = new Set(["demo", "real"]);
const validOrderTypesEnum = Object.freeze({ BUY: "BUY", SELL: "SELL" });

/**
 * Obtiene credenciales y baseUrl para demo o real
 * @param {string} mode - 'demo' o 'real'
 * @returns {object} { apiKey, baseUrl }
 * @throws {Error} Si falta la API key
 */
export function getCredentials(mode = "demo") {
  if (!validModes.has(mode)) {
    throw new RangeError(`Modo inválido: "${mode}". Debe ser 'demo' o 'real'`);
  }

  const baseUrl = mode === "real" ? CAPITAL_REAL_URL : CAPITAL_DEMO_URL;
  const envVar = mode === "real" ? "CAPITAL_API_KEY_REAL" : "CAPITAL_API_KEY_DEMO";
  const apiKey = process.env[envVar];

  if (!apiKey || apiKey.trim() === "") {
    const msg = `API Key no configurada para modo "${mode}". Variable de entorno "${envVar}" faltante o vacía.`;
    logger(levels.ERROR, msg);
    throw new Error(msg);
  }

  logger(levels.DEBUG, `Credenciales cargadas para modo: ${mode}`, {
    apiKeyPrefix: apiKey.substring(0, 8),
    baseUrl,
  });

  return { apiKey, baseUrl };
}

/**
 * Valida parámetros de orden de forma exhaustiva
 * @param {string} type - 'BUY' o 'SELL'
 * @param {string} symbol - Símbolo del instrumento
 * @param {number} amount - Cantidad a operar
 * @throws {TypeError} Si algún parámetro es inválido
 */
export function validateOrderParams(type, symbol, amount) {
  if (!type || !validOrderTypes.has(type.toUpperCase())) {
    throw new TypeError(`Parámetro "type" inválido. Esperado: 'BUY' o 'SELL'. Recibido: "${type}"`);
  }

  if (!symbol || typeof symbol !== "string" || symbol.trim() === "") {
    throw new TypeError(
      `Parámetro "symbol" inválido. Esperado: string no vacío. Recibido: "${symbol}"`
    );
  }

  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    throw new TypeError(`Parámetro "amount" inválido. Esperado: número > 0. Recibido: ${amount}`);
  }

  // Validación adicional de symbol format (Capital.com epic format)
  const epicPattern = /^[A-Z0-9._-]+$/i;
  if (!epicPattern.test(symbol.trim())) {
    throw new TypeError(
      `Formato de symbol inválido. Debe contener solo letras, números, puntos, guiones y guiones bajos. Recibido: "${symbol}"`
    );
  }
}

/**
 * Valida opciones avanzadas de la orden
 * @param {object} options - Opciones de stop/profit
 * @throws {TypeError} Si alguna opción es inválida
 */
function validateOrderOptions(options = {}) {
  const numericFields = ["stopLevel", "profitLevel", "stopDistance", "profitDistance"];

  for (const field of numericFields) {
    if (options[field] !== undefined) {
      if (typeof options[field] !== "number" || isNaN(options[field])) {
        throw new TypeError(
          `Opción "${field}" debe ser un número válido. Recibido: ${options[field]}`
        );
      }
    }
  }

  if (options.guaranteedStop !== undefined && typeof options.guaranteedStop !== "boolean") {
    throw new TypeError(
      `Opción "guaranteedStop" debe ser boolean. Recibido: ${options.guaranteedStop}`
    );
  }
}

// ===========================================================
// 📤 FUNCIÓN PRINCIPAL: ENVIAR ORDEN ULTRA PRO
// ===========================================================

/**
 * Enviar orden a API Capital.com con manejo profesional de errores
 * @param {string} type - 'BUY' o 'SELL'
 * @param {string} symbol - Epic del instrumento (ej: 'CS.D.EURUSD.MINI.IP')
 * @param {number} amount - Tamaño de la posición
 * @param {string} mode - 'demo' o 'real'
 * @param {object} options - Opciones adicionales (stops, profits)
 * @returns {Promise<object>} Resultado de la operación
 */
export async function placeOrder(type, symbol, amount, mode = "demo", options = {}) {
  const start = Date.now();
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    logger(levels.INFO, `[${requestId}] 🚀 Iniciando orden`, {
      type,
      symbol,
      amount,
      mode,
      options,
    });

    // Validaciones
    if (!validModes.has(mode)) {
      throw new RangeError(`Modo inválido: "${mode}". Debe ser 'demo' o 'real'`);
    }

    validateOrderParams(type, symbol, amount);
    validateOrderOptions(options);

    const { apiKey, baseUrl } = getCredentials(mode);
    const endpoint = `${baseUrl}/api/v1/positions/otc`;

    // Construir body optimizado
    const body = {
      direction: type.toUpperCase(),
      epic: symbol.trim(),
      size: amount,
      guaranteedStop: Boolean(options.guaranteedStop || false),
    };

    // Agregar campos opcionales solo si están definidos
    if (options.stopLevel !== undefined) body.stopLevel = options.stopLevel;
    if (options.profitLevel !== undefined) body.profitLevel = options.profitLevel;
    if (options.stopDistance !== undefined) body.stopDistance = options.stopDistance;
    if (options.profitDistance !== undefined) body.profitDistance = options.profitDistance;

    const headers = {
      ...(await getAuthHeaders(mode, apiKey, baseUrl)),
      "X-Request-ID": requestId,
    };

    logger(levels.DEBUG, `[${requestId}] 📤 Enviando POST`, {
      endpoint,
      body,
    });

    // Ejecutar request con retry
    const response = await axiosRetry(() => axiosInstance.post(endpoint, body, { headers }));

    const duration = Date.now() - start;

    if (response.status >= 200 && response.status < 300) {
      logger(levels.SUCCESS, `[${requestId}] Orden ejecutada en ${duration}ms`, {
        status: response.status,
        data: response.data,
      });

      return {
        success: true,
        data: response.data,
        mode,
        duration,
        requestId,
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
  } catch (error) {
    const duration = Date.now() - start;

    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      duration,
      requestId,
    };

    logger(levels.ERROR, `[${requestId}] Error enviando orden tras ${duration}ms`, errorDetails);

    return {
      success: false,
      error: error.message,
      details: errorDetails,
      mode,
      duration,
      requestId,
      timestamp: new Date().toISOString(),
    };
  }
}

// ===========================================================
// 🧹 CERRAR POSICIÓN CON VALIDACIÓN ULTRA
// ===========================================================

/**
 * Cierra una posición abierta
 * @param {string} dealId - ID de la posición a cerrar
 * @param {string} mode - 'demo' o 'real'
 * @returns {Promise<object>} Resultado de la operación
 */
export async function closePosition(dealId, mode = "demo") {
  const start = Date.now();
  const requestId = `CLOSE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    if (!dealId || typeof dealId !== "string" || dealId.trim() === "") {
      throw new TypeError(`"dealId" debe ser un string no vacío. Recibido: "${dealId}"`);
    }

    if (!validModes.has(mode)) {
      throw new RangeError(`Modo inválido: "${mode}". Debe ser 'demo' o 'real'`);
    }

    const { apiKey, baseUrl } = getCredentials(mode);
    const endpoint = `${baseUrl}/api/v1/positions/${dealId.trim()}`;
    const headers = {
      ...(await getAuthHeaders(mode, apiKey, baseUrl)),
      "X-Request-ID": requestId,
    };

    logger(levels.INFO, `[${requestId}] 🔒 Cerrando posición: ${dealId}`);

    const response = await axiosRetry(() => axiosInstance.delete(endpoint, { headers }));

    const duration = Date.now() - start;

    if (response.status >= 200 && response.status < 300) {
      logger(levels.SUCCESS, `[${requestId}] Posición cerrada en ${duration}ms`, {
        dealId,
        data: response.data,
      });

      return {
        success: true,
        data: response.data,
        dealId,
        duration,
        requestId,
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
  } catch (error) {
    const duration = Date.now() - start;

    logger(levels.ERROR, `[${requestId}] Error cerrando posición tras ${duration}ms`, {
      dealId,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    return {
      success: false,
      error: error.message,
      dealId,
      duration,
      requestId,
      timestamp: new Date().toISOString(),
    };
  }
}

// ===========================================================
// 📊 OBTENER POSICIONES ABIERTAS
// ===========================================================

/**
 * Obtiene todas las posiciones abiertas
 * @param {string} mode - 'demo' o 'real'
 * @returns {Promise<object>} Lista de posiciones
 */
export async function getPositions(mode = "demo") {
  const start = Date.now();
  const requestId = `POS-${Date.now()}`;

  try {
    if (!validModes.has(mode)) {
      throw new RangeError(`Modo inválido: "${mode}"`);
    }

    const { apiKey, baseUrl } = getCredentials(mode);
    const endpoint = `${baseUrl}/api/v1/positions`;
    const headers = {
      ...(await getAuthHeaders(mode, apiKey, baseUrl)),
      "X-Request-ID": requestId,
    };

    logger(levels.INFO, `[${requestId}] 📊 Obteniendo posiciones`);

    const response = await axiosRetry(() => axiosInstance.get(endpoint, { headers }));

    const duration = Date.now() - start;

    if (response.status >= 200 && response.status < 300) {
      logger(levels.SUCCESS, `[${requestId}] Posiciones obtenidas en ${duration}ms`, {
        count: response.data?.positions?.length || 0,
      });

      return {
        success: true,
        data: response.data,
        duration,
        requestId,
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
  } catch (error) {
    logger(levels.ERROR, `[${requestId}] Error obteniendo posiciones`, {
      error: error.message,
    });

    return {
      success: false,
      error: error.message,
      requestId,
      timestamp: new Date().toISOString(),
    };
  }
}

// ===========================================================
// 💰 INFORMACIÓN DE CUENTA ULTRA DETALLADA
// ===========================================================

/**
 * Obtiene información detallada de la cuenta
 * @param {string} mode - 'demo' o 'real'
 * @returns {Promise<object>} Información de cuenta
 */
export async function getAccountInfo(mode = "demo") {
  const start = Date.now();
  const requestId = `ACC-${Date.now()}`;

  try {
    if (!validModes.has(mode)) {
      throw new RangeError(`Modo inválido: "${mode}"`);
    }

    const { apiKey, baseUrl } = getCredentials(mode);
    const endpoint = `${baseUrl}/api/v1/accounts`;
    const headers = {
      ...(await getAuthHeaders(mode, apiKey, baseUrl)),
      "X-Request-ID": requestId,
    };

    logger(levels.INFO, `[${requestId}] 💰 Solicitando info de cuenta`);

    const response = await axiosRetry(() => axiosInstance.get(endpoint, { headers }));

    const duration = Date.now() - start;

    if (response.status >= 200 && response.status < 300) {
      logger(levels.SUCCESS, `[${requestId}] Info de cuenta obtenida en ${duration}ms`);

      return {
        success: true,
        data: response.data,
        duration,
        requestId,
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
  } catch (error) {
    logger(levels.ERROR, `[${requestId}] Error obteniendo info de cuenta`, {
      error: error.message,
    });

    return {
      success: false,
      error: error.message,
      requestId,
      timestamp: new Date().toISOString(),
    };
  }
}

// ===========================================================
// 🔍 TEST DE CONEXIÓN ULTRA PRO
// ===========================================================

/**
 * Verifica la conexión con la API de Capital.com
 * @param {string} mode - 'demo' o 'real'
 * @returns {Promise<object>} Estado de conexión
 */
export async function testConnection(mode = "demo") {
  const start = Date.now();
  const requestId = `PING-${Date.now()}`;

  try {
    if (!validModes.has(mode)) {
      throw new RangeError(`Modo inválido: "${mode}"`);
    }

    const { apiKey, baseUrl } = getCredentials(mode);
    const endpoint = `${baseUrl}/api/v1/ping`;
    const headers = {
      "X-CAP-API-KEY": apiKey,
      "X-Request-ID": requestId,
    };

    logger(levels.INFO, `[${requestId}] 🔍 Testeando conexión API (${mode})`);

    const response = await axiosInstance.get(endpoint, {
      headers,
      timeout: 10000,
    });

    const duration = Date.now() - start;

    if (response.status >= 200 && response.status < 300) {
      logger(
        levels.SUCCESS,
        `[${requestId}] Conexión exitosa (${duration}ms) - Latencia: ${duration}ms`
      );

      return {
        success: true,
        mode,
        latency: duration,
        data: response.data,
        requestId,
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
  } catch (error) {
    const duration = Date.now() - start;

    logger(levels.ERROR, `[${requestId}] Error de conexión tras ${duration}ms`, {
      error: error.message,
      code: error.code,
    });

    return {
      success: false,
      error: error.message,
      mode,
      duration,
      requestId,
      timestamp: new Date().toISOString(),
    };
  }
}

// ===========================================================
// 🎯 HEALTHCHECK COMPLETO DEL SERVICIO
// ===========================================================

/**
 * Ejecuta un healthcheck completo del servicio
 * @returns {Promise<object>} Estado completo del sistema
 */
export async function healthCheck() {
  logger(levels.INFO, "🏥 Iniciando healthcheck completo del sistema");

  const results = {
    timestamp: new Date().toISOString(),
    demo: { available: false },
    real: { available: false },
    environment: {
      demoKeyConfigured: Boolean(process.env.CAPITAL_API_KEY_DEMO),
      realKeyConfigured: Boolean(process.env.CAPITAL_API_KEY_REAL),
      nodeVersion: process.version,
      platform: process.platform,
    },
  };

  // Test demo
  try {
    const demoTest = await testConnection("demo");
    results.demo = demoTest;
  } catch (error) {
    results.demo.error = error.message;
  }

  // Test real
  try {
    const realTest = await testConnection("real");
    results.real = realTest;
  } catch (error) {
    results.real.error = error.message;
  }

  const overallStatus = results.demo.success || results.real.success;

  logger(
    overallStatus ? levels.SUCCESS : levels.ERROR,
    `Healthcheck completado - Status: ${overallStatus ? "HEALTHY" : "UNHEALTHY"}`,
    results
  );

  return {
    success: overallStatus,
    ...results,
  };
}

// ===========================================================
// 🎯 1. MODIFICAR STOP LOSS Y TAKE PROFIT DE POSICIÓN ABIERTA
// ===========================================================
export async function updatePosition(dealId, levels, mode = "demo") {
  const start = Date.now();
  const requestId = `UPDATE-${Date.now()}`;

  try {
    if (!dealId || typeof dealId !== "string")
      throw new TypeError("dealId debe ser un string válido");
    if (!validModes.has(mode)) throw new RangeError(`Modo inválido: "${mode}"`);
    if (!levels || typeof levels !== "object")
      throw new TypeError("levels debe ser un objeto con stopLevel, profitLevel o trailingStop");

    const { apiKey, baseUrl } = getCredentials(mode);
    const endpoint = `${baseUrl}/api/v1/positions/${dealId}`;
    const headers = { ...(await getAuthHeaders(mode, apiKey, baseUrl)), "X-Request-ID": requestId };

    const body = {};
    if (levels.stopLevel !== undefined) {
      if (typeof levels.stopLevel !== "number") throw new TypeError("stopLevel debe ser un número");
      body.stopLevel = levels.stopLevel;
    }
    if (levels.profitLevel !== undefined) {
      if (typeof levels.profitLevel !== "number")
        throw new TypeError("profitLevel debe ser un número");
      body.profitLevel = levels.profitLevel;
    }
    if (levels.trailingStop !== undefined) {
      if (typeof levels.trailingStop !== "number")
        throw new TypeError("trailingStop debe ser un número");
      body.trailingStop = levels.trailingStop;
    }

    logger(levels.INFO, `[${requestId}] 🔧 Modificando posición ${dealId}`, body);

    const response = await axiosRetry(() => axiosInstance.put(endpoint, body, { headers }));
    const duration = Date.now() - start;

    if (response.status >= 200 && response.status < 300) {
      logger(levels.SUCCESS, `[${requestId}] Posición modificada en ${duration}ms`);
      return {
        success: true,
        data: response.data,
        dealId,
        duration,
        requestId,
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
  } catch (error) {
    logger(levels.ERROR, `[${requestId}] Error modificando posición`, {
      dealId,
      error: error.message,
    });
    return {
      success: false,
      error: error.message,
      dealId,
      requestId,
      timestamp: new Date().toISOString(),
    };
  }
}

// ===========================================================
// 🧹 2. CERRAR TODAS LAS POSICIONES DE GOLPE
// ===========================================================
export async function closeAllPositions(mode = "demo") {
  const start = Date.now();
  const requestId = `CLOSE-ALL-${Date.now()}`;

  try {
    if (!validModes.has(mode)) throw new RangeError(`Modo inválido: "${mode}"`);
    logger(levels.INFO, `[${requestId}] 🚨 Cerrando TODAS las posiciones en ${mode}`);

    const positionsResult = await getPositions(mode);
    if (!positionsResult.success) throw new Error("No se pudieron obtener las posiciones");

    const positions = positionsResult.data?.positions || [];
    if (positions.length === 0)
      return {
        success: true,
        message: "No hay posiciones para cerrar",
        closed: 0,
        total: 0,
        duration: Date.now() - start,
        requestId,
        timestamp: new Date().toISOString(),
      };

    const results = await Promise.allSettled(
      positions.map((pos) => closePosition(pos.dealId, mode))
    );
    const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const failed = results
      .filter((r) => r.status === "rejected" || !r.value.success)
      .map((r) => r.reason || r.value?.error);
    const duration = Date.now() - start;

    logger(
      levels.SUCCESS,
      `[${requestId}] Cerradas ${successful}/${positions.length} posiciones en ${duration}ms`
    );
    if (failed.length) logger(levels.ERROR, `[${requestId}] Errores en cierres:`, failed);

    return {
      success: true,
      message: `Se cerraron ${successful}/${positions.length} posiciones`,
      closed: successful,
      total: positions.length,
      failed,
      details: results,
      duration,
      requestId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger(levels.ERROR, `[${requestId}] Error cerrando todas las posiciones`, {
      error: error.message,
    });
    return { success: false, error: error.message, requestId, timestamp: new Date().toISOString() };
  }
}

// ===========================================================
// 📉 3. CERRAR SOLO POSICIONES EN PÉRDIDA
// ===========================================================
export async function closeLosingPositions(maxLossPercent = -2, mode = "demo") {
  const start = Date.now();
  const requestId = `CLOSE-LOSS-${Date.now()}`;

  try {
    if (typeof maxLossPercent !== "number" || maxLossPercent > 0)
      throw new TypeError("maxLossPercent debe ser un número negativo (ej: -2)");

    logger(levels.INFO, `[${requestId}] 📉 Cerrando posiciones con pérdida > ${maxLossPercent}%`);

    const positionsResult = await getPositions(mode);
    if (!positionsResult.success) throw new Error("No se pudieron obtener las posiciones");

    const positions = positionsResult.data?.positions || [];
    if (positions.length === 0)
      return {
        success: true,
        message: "No hay posiciones abiertas",
        closed: 0,
        analyzed: 0,
        timestamp: new Date().toISOString(),
      };

    const losingPositions = positions.filter((pos) => {
      const profitLoss = parseFloat(pos.profit) || 0;
      const level = parseFloat(pos.level) || 1;
      const size = parseFloat(pos.size) || 1;
      const percentChange = level && size ? (profitLoss / (level * size)) * 100 : 0;
      return percentChange <= maxLossPercent;
    });

    if (losingPositions.length === 0)
      return {
        success: true,
        message: `No hay posiciones con pérdida mayor a ${maxLossPercent}%`,
        closed: 0,
        analyzed: positions.length,
        timestamp: new Date().toISOString(),
      };

    const results = await Promise.allSettled(
      losingPositions.map((pos) => closePosition(pos.dealId, mode))
    );
    const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const failed = results
      .filter((r) => r.status === "rejected" || !r.value.success)
      .map((r) => r.reason || r.value?.error);
    const duration = Date.now() - start;

    logger(
      levels.SUCCESS,
      `[${requestId}] Cerradas ${successful}/${losingPositions.length} posiciones perdedoras`
    );
    if (failed.length)
      logger(levels.ERROR, `[${requestId}] Errores en cierres perdedores:`, failed);

    return {
      success: true,
      message: `Cerradas ${successful}/${losingPositions.length} posiciones en pérdida`,
      closed: successful,
      analyzed: positions.length,
      threshold: maxLossPercent,
      failed,
      details: results,
      duration,
      requestId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger(levels.ERROR, `[${requestId}] Error cerrando posiciones perdedoras`, {
      error: error.message,
    });
    return { success: false, error: error.message, requestId, timestamp: new Date().toISOString() };
  }
}

// ===========================================================
// 📈 4. TOMAR GANANCIAS AUTOMÁTICO
// ===========================================================
export async function takeProfits(minProfitPercent = 3, mode = "demo") {
  const start = Date.now();
  const requestId = `TAKE-PROFIT-${Date.now()}`;

  try {
    if (typeof minProfitPercent !== "number" || minProfitPercent < 0)
      throw new TypeError("minProfitPercent debe ser un número positivo (ej: 3)");

    logger(
      levels.INFO,
      `[${requestId}] 💰 Cerrando posiciones con ganancia > ${minProfitPercent}%`
    );

    const positionsResult = await getPositions(mode);
    if (!positionsResult.success) throw new Error("No se pudieron obtener las posiciones");

    const positions = positionsResult.data?.positions || [];
    if (positions.length === 0)
      return {
        success: true,
        message: "No hay posiciones abiertas",
        closed: 0,
        analyzed: 0,
        timestamp: new Date().toISOString(),
      };

    const profitablePositions = positions.filter((pos) => {
      const profitLoss = parseFloat(pos.profit) || 0;
      const level = parseFloat(pos.level) || 1;
      const size = parseFloat(pos.size) || 1;
      const percentChange = level && size ? (profitLoss / (level * size)) * 100 : 0;
      return percentChange >= minProfitPercent;
    });

    if (profitablePositions.length === 0)
      return {
        success: true,
        message: `No hay posiciones con ganancia mayor a ${minProfitPercent}%`,
        closed: 0,
        analyzed: positions.length,
        timestamp: new Date().toISOString(),
      };

    const results = await Promise.allSettled(
      profitablePositions.map((pos) => closePosition(pos.dealId, mode))
    );
    const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const failed = results
      .filter((r) => r.status === "rejected" || !r.value.success)
      .map((r) => r.reason || r.value?.error);
    const duration = Date.now() - start;

    logger(
      levels.SUCCESS,
      `[${requestId}] 💸 Cerradas ${successful}/${profitablePositions.length} posiciones ganadoras`
    );
    if (failed.length) logger(levels.ERROR, `[${requestId}] Errores en cierres ganadores:`, failed);

    return {
      success: true,
      message: `Cerradas ${successful}/${profitablePositions.length} posiciones en ganancia`,
      closed: successful,
      analyzed: positions.length,
      threshold: minProfitPercent,
      failed,
      details: results,
      duration,
      requestId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger(levels.ERROR, `[${requestId}] Error tomando ganancias`, { error: error.message });
    return { success: false, error: error.message, requestId, timestamp: new Date().toISOString() };
  }
}

// ===========================================================
// 📊 5. RESUMEN DE POSICIONES CON ESTADÍSTICAS
// ===========================================================
export async function getPositionsSummary(mode = "demo") {
  const requestId = `SUMMARY-${Date.now()}`;

  try {
    const positionsResult = await getPositions(mode);
    if (!positionsResult.success) throw new Error("No se pudieron obtener las posiciones");

    const positions = positionsResult.data?.positions || [];
    if (positions.length === 0)
      return {
        success: true,
        total: 0,
        winning: 0,
        losing: 0,
        totalProfit: 0,
        message: "No hay posiciones abiertas",
        timestamp: new Date().toISOString(),
      };

    let totalProfit = 0;
    let winning = 0;
    let losing = 0;
    const details = [];

    positions.forEach((pos) => {
      const profit = parseFloat(pos.profit) || 0;
      const level = parseFloat(pos.level) || 1;
      const size = parseFloat(pos.size) || 1;
      totalProfit += profit;

      if (profit > 0) winning++;
      else if (profit < 0) losing++;

      const percent = level && size ? ((profit / (level * size)) * 100).toFixed(2) : "0.00";
      details.push({
        dealId: pos.dealId,
        epic: pos.epic,
        direction: pos.direction,
        size: pos.size,
        profit: profit.toFixed(2),
        profitPercent: percent + "%",
      });
    });

    logger(
      levels.INFO,
      `[${requestId}] 📊 Resumen: ${positions.length} posiciones | P/L: ${totalProfit.toFixed(2)}`
    );

    return {
      success: true,
      total: positions.length,
      winning,
      losing,
      neutral: positions.length - winning - losing,
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      averageProfit: parseFloat((totalProfit / positions.length).toFixed(2)),
      details,
      requestId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger(levels.ERROR, `[${requestId}] Error obteniendo resumen`, { error: error.message });
    return { success: false, error: error.message, requestId, timestamp: new Date().toISOString() };
  }
}

// ===========================================================
// 📈 EXPORTACIONES Y CONSTANTES
// ===========================================================

export { validOrderTypesEnum as OrderTypes };

export default {
  placeOrder,
  closePosition,
  getPositions,
  getAccountInfo,
  testConnection,
  healthCheck,
  getCredentials,
  validateOrderParams,

  // 🆕 NUEVAS FUNCIONES AVANZADAS
  updatePosition,
  closeAllPositions,
  closeLosingPositions,
  takeProfits,
  getPositionsSummary,
};
