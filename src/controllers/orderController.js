// src/controllers/orderController.js
import * as capitalService from '../services/capitalService.js';

const levels = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

const logger = (level, msg, data = null) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${level}] ${timestamp} - [orderController] ${msg}`;
  if (level === levels.ERROR) {
    console.error(logMsg, data || '');
  } else if (level === levels.WARN) {
    console.warn(logMsg, data || '');
  } else {
    console.log(logMsg, data || '');
  }
};

/**
 * Crear nueva orden
 */
export async function createOrder(req, res) {
  const { type, symbol, amount, mode, options } = req.body;
  logger(levels.INFO, 'Solicitando creación de orden', { type, symbol, amount, mode });

  try {
    const result = await capitalService.placeOrder(type, symbol, amount, mode, options);

    if (result.success) {
      logger(levels.INFO, 'Orden creada exitosamente');
      return res.status(201).json({ success: true, data: result.data });
    }

    logger(levels.WARN, 'Error creando orden', result.error);
    return res.status(400).json({ success: false, error: result.error, details: result.details });
  } catch (error) {
    logger(levels.ERROR, 'Excepción creando orden', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

/**
 * Cancelar orden (cerrar posición)
 */
export async function cancelOrder(req, res) {
  const { dealId, mode } = req.body;
  logger(levels.INFO, `Solicitando cancelación de orden dealId: ${dealId}, modo: ${mode}`);

  if (!dealId) {
    const errorMsg = 'Parámetro dealId es requerido para cancelar la orden.';
    logger(levels.WARN, errorMsg);
    return res.status(400).json({ success: false, error: errorMsg });
  }

  try {
    const result = await capitalService.closePosition(dealId, mode);

    if (result.success) {
      logger(levels.INFO, `Orden cancelada correctamente dealId: ${dealId}`);
      return res.status(200).json({ success: true, data:  result.data });
    }

    logger(levels.WARN, `Error cancelando orden dealId: ${dealId}`, result.error);
    return res.status(400).json({ success: false, error: result.error });
  } catch (error) {
    logger(levels.ERROR, 'Excepción cancelando orden', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}
