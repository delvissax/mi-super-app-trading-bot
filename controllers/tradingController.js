// src/controllers/tradingController.js
import * as capitalService from '../services/capitalService.js';

const levels = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

const logger = (level, msg, data = null) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${level}] ${timestamp} - [tradingController] ${msg}`;
  if (level === levels.ERROR) {
    console.error(logMsg, data || '');
  } else if (level === levels.WARN) {
    console.warn(logMsg, data || '');
  } else {
    console.log(logMsg, data || '');
  }
};

/**
 * Ejecuta una orden de trading (compra/venta)
 */
export async function executeTrade(req, res) {
  const { type, symbol, amount, mode = 'demo', options = {} } = req.body;

  logger(levels.INFO, `Iniciando trade: ${type} ${amount} ${symbol} en modo ${mode}`);

  try {
    if (!['buy', 'sell'].includes(type?.toLowerCase())) {
      const errMsg = 'Parámetro "type" inválido. Debe ser "buy" o "sell".';
      logger(levels.WARN, errMsg);
      return res.status(400).json({ success: false, error: errMsg });
    }

    const result = await capitalService.placeOrder(type, symbol, amount, mode, options);

    if (!result.success) {
      logger(levels.WARN, 'Error ejecutando trade', result.error);
      return res.status(400).json({ success: false, error: result.error });
    }

    logger(levels.INFO, 'Trade ejecutado con éxito');
    return res.status(200).json({ success: true,  result.data });
  } catch (error) {
    logger(levels.ERROR, 'Excepción en executeTrade', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
  }
}

/**
 * Consulta posiciones abiertas o cerradas (puedes adaptarlo)
 */
export async function getPositions(req, res) {
  const mode = req.query.mode || 'demo';
  // Implementar llamada a capitalService si disponible para posiciones
  logger(levels.INFO, `Solicitud de posiciones modo=${mode}`);

  // Placeholder para expandir según API disponible
  return res.json({
    success: true,
     [],
    message: 'Funcionalidad pendiente de implementación para obtener posiciones.',
  });
}
