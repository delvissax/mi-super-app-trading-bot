// src/controllers/healthController.js

const levels = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

const logger = (level, msg, data = null) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${level}] ${timestamp} - [healthController] ${msg}`;
  if (level === levels.ERROR) {
    console.error(logMsg, data || '');
  } else if (level === levels.WARN) {
    console.warn(logMsg, data || '');
  } else {
    console.log(logMsg, data || '');
  }
};

/**
 * Endpoint para verificar el estado de salud básico de la API.
 * @param {Request} req 
 * @param {Response} res 
 */
export async function healthCheck(req, res) {
  logger(levels.INFO, 'Petición de health check recibida.');

  try {
    // Aquí puedes agregar chequeos extendidos, p.ej. base de datos, servicios externos
    const healthStatus = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };

    logger(levels.INFO, 'Health check OK', healthStatus);
    return res.status(200).json({ success: true,  healthStatus });
  } catch (error) {
    logger(levels.ERROR, 'Error en health check', error);
    return res.status(500).json({ success: false, error: 'Servicio no disponible' });
  }
}
