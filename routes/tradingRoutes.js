// routes/tradingRoutes.js

const express = require('express');
const router = express.Router();

// Importar controladores para trading
const {
  placeTrade,
  getTradeById,
  cancelTrade,
  listTrades,
  getTradeHistory
} = require('../controllers/tradingController');

// Prefijo base: /api/trading

// Ruta para realizar una operación de trading
router.post('/', placeTrade);

// Obtener detalles específicos de una operación de trading
router.get('/:tradeId', getTradeById);

// Cancelar una operación de trading específica
router.delete('/:tradeId', cancelTrade);

// Listar todas las operaciones de trading (con filtros y paginación)
router.get('/', listTrades);

// Obtener historial de operaciones de trading para un usuario
router.get('/history/:userId', getTradeHistory);

module.exports = router;

import dotenv from 'dotenv';
dotenv.config();

/**
 * Devuelve los headers de autenticación para Capital.com
 * @param {boolean} isDemo - true si es demo, false si es real
 * @returns {object} headers con API Key
 */
export function getAuthHeaders(isDemo = true) {
    const apiKey = isDemo
        ? process.env.CAPITAL_API_KEY_DEMO
        : process.env.CAPITAL_API_KEY_REAL;

    if (!apiKey) {
        throw new Error(`API Key ${isDemo ? 'DEMO' : 'REAL'} no encontrada en .env`);
    }

    return {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };
}
