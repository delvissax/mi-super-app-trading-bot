// src/controllers/accountController.js
import * as capitalService from '../services/capitalService.js';

const levels = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

const logger = (level, msg, data = null) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${level}] ${timestamp} - [accountController] ${msg}`;
  if (level === levels.ERROR) {
    console.error(logMsg, data || '');
  } else if (level === levels.WARN) {
    console.warn(logMsg, data || '');
  } else {
    console.log(logMsg, data || '');
  }
};

/**
 * Controlador para obtener información de la cuenta
 * @param {Request} req 
 * @param {Response} res 
 */
export async function getAccountInfo(req, res) {
  const mode = req.query.mode || 'demo'; // por defecto modo demo

  logger(levels.INFO, `Petición para obtener información de cuenta en modo: ${mode}`);

  // Validar modo
  if (!['demo', 'real'].includes(mode)) {
    const errorMessage = `Modo inválido recibido: "${mode}". Debe ser 'demo' o 'real'.`;
    logger(levels.WARN, errorMessage);
    return res.status(400).json({ success: false, error: errorMessage });
  }

  try {
    const result = await capitalService.getAccountInfo(mode);

    if (!result.success) {
      const errorMessage = `Error al obtener info de cuenta: ${result.error || 'Desconocido'}`;
      logger(levels.ERROR, errorMessage, result.details);
      return res.status(502).json({ success: false, error: errorMessage });
    }

    logger(levels.INFO, 'Información de cuenta obtenida exitosamente.');
    return res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    logger(levels.ERROR, 'Excepción inesperada en getAccountInfo', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
  }
}
