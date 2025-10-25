// src/routes/tradingRoutes.js
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const router = express.Router();

// Importar controladores para trading
const {
  placeTrade,
  getTradeById,
  cancelTrade,
  listTrades,
  getTradeHistory,
  getTradingStatus,
  getMarketAnalysis,
  executeQuickTrade,
  modifyTrade,
  getOpenPositions,
  closeAllPositions,
  getTradingMetrics,
} = require('../controllers/tradingController');

// Middleware de logging para trading
const tradingLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[TRADING] ${timestamp} - ${req.method} ${req.originalUrl}`);
  next();
};

// Middleware de validación de API Key
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API Key requerida',
    });
  }

  // Validación básica de API Key (expandir según necesidades)
  if (apiKey.length < 10) {
    return res.status(401).json({
      success: false,
      error: 'API Key inválida',
    });
  }

  req.apiKey = apiKey;
  next();
};

// Aplicar middlewares a todas las rutas de trading
router.use(tradingLogger);
router.use(validateApiKey);

// Prefijo base: /api/trading

// ==================== RUTAS PRINCIPALES ====================

// Ruta para realizar una operación de trading
router.post('/', placeTrade);

// Ruta rápida para trading (sin validaciones complejas)
router.post('/quick', executeQuickTrade);

// Obtener detalles específicos de una operación de trading
router.get('/:tradeId', getTradeById);

// Modificar una operación de trading existente
router.put('/:tradeId', modifyTrade);

// Cancelar una operación de trading específica
router.delete('/:tradeId', cancelTrade);

// Listar todas las operaciones de trading (con filtros y paginación)
router.get('/', listTrades);

// ==================== RUTAS DE ANÁLISIS ====================

// Obtener historial de operaciones de trading para un usuario
router.get('/history/:userId', getTradeHistory);

// Obtener estado del sistema de trading
router.get('/status/system', getTradingStatus);

// Obtener análisis de mercado
router.get('/analysis/market', getMarketAnalysis);

// Obtener métricas de trading
router.get('/metrics/performance', getTradingMetrics);

// ==================== RUTAS DE POSICIONES ====================

// Obtener posiciones abiertas
router.get('/positions/open', getOpenPositions);

// Cerrar todas las posiciones
router.post('/positions/close-all', closeAllPositions);

// ==================== RUTAS DE HEALTH CHECK ====================

// Health check específico para trading
router.get('/health/check', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sistema de trading operativo',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ==================== MANEJO DE ERRORES ====================

// Manejo de rutas no encontradas específicas para trading
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta de trading no encontrada: ${req.originalUrl}`,
    availableRoutes: [
      'POST /',
      'POST /quick',
      'GET /',
      'GET /:tradeId',
      'PUT /:tradeId',
      'DELETE /:tradeId',
      'GET /history/:userId',
      'GET /status/system',
      'GET /analysis/market',
      'GET /metrics/performance',
      'GET /positions/open',
      'POST /positions/close-all',
      'GET /health/check',
    ],
  });
});

// Middleware de error handling para trading
router.use((error, req, res, _next) => {
  console.error('[TRADING ERROR]', error);
  
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor de trading',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Contacte al administrador',
  });
});

module.exports = router;