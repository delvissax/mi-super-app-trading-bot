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

