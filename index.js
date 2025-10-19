// index.js - TRADING BOT ULTRA PRO MAX LEVEL DIOS 🔥🚀
import crypto from 'crypto';
import { performance } from 'perf_hooks';
import express from 'express';
import compression from 'compression';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import nodeCron from 'node-cron';
import { WebSocketServer } from 'ws';
import capitalService from './src/services/capitalService.js';

// ===========================================================
// 🌟 CONFIGURACIÓN INICIAL ULTRA PRO
// ===========================================================
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const wss = new WebSocketServer({ server, path: '/ws' });

// ===========================================================
// 📊 SISTEMA DE MÉTRICAS EN TIEMPO REAL
// ===========================================================
const metrics = {
  requests: { total: 0, success: 0, errors: 0 },
  orders: { total: 0, success: 0, failed: 0 },
  websocket: { connected: 0, totalConnections: 0 },
  uptime: { start: Date.now() },
  lastActivity: new Date().toISOString(),
};

// Función para actualizar métricas
const updateMetrics = (category, type) => {
  if (metrics[category]) {
    metrics[category][type] = (metrics[category][type] || 0) + 1;
  }
  metrics.lastActivity = new Date().toISOString();
};

// ===========================================================
// 🎨 LOGGER ULTRA PRO CON COLORES Y EMOJIS
// ===========================================================
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
};

const logger = {
  info: (msg, data) => {
    console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`, data || '');
  },
  success: (msg, data) => {
    console.log(`${colors.green}[SUCCESS]${colors.reset} ✅ ${msg}`, data || '');
  },
  warn: (msg, data) => {
    console.warn(`${colors.yellow}[WARN]${colors.reset} ⚠️  ${msg}`, data || '');
  },
  error: (msg, data) => {
    console.error(`${colors.red}[ERROR]${colors.reset} ❌ ${msg}`, data || '');
  },
  trade: (msg, data) => {
    console.log(`${colors.magenta}[TRADE]${colors.reset} 📈 ${msg}`, data || '');
  },
  ws: (msg, data) => {
    console.log(`${colors.bright}[WebSocket]${colors.reset} 🔌 ${msg}`, data || '');
  },
};

// ===========================================================
// 🛡️ MIDDLEWARES ULTRA SEGUROS
// ===========================================================
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: NODE_ENV === 'production',
}));


// Morgan personalizado con colores
const morganFormat = NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  skip: (req) => req.url === '/health' || req.url === '/metrics',
}));

// Middleware para logging de requests
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    updateMetrics('requests', 'total');
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      updateMetrics('requests', 'success');
    } else if (res.statusCode >= 400) {
      updateMetrics('requests', 'errors');
    }
    
    if (duration > 1000) {
      logger.warn(`Respuesta lenta: ${req.method} ${req.url} - ${duration}ms`);
    }
  });
  
  next();
});

// Middleware de seguridad - Rate limiting básico
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX = 100; // 100 requests por minuto

app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const record = rateLimitMap.get(ip);
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    logger.warn(`Rate limit excedido para IP: ${ip}`);
    return res.status(429).json({
      success: false,
      error: 'Demasiadas peticiones. Intenta de nuevo en 1 minuto.',
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    });
  }
  
  record.count++;
  next();
});

// Limpiar rate limit map cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 300000);

// ===========================================================
// 🏠 ENDPOINTS PRINCIPALES ULTRA PRO
// ===========================================================

// Root endpoint con info del sistema
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: '🚀 Trading Bot Ultra Pro Max',
    version: '2.0.0',
    environment: NODE_ENV,
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      orders: '/api/orders',
      positions: '/api/positions',
      account: '/api/account',
      websocket: 'ws://localhost:' + PORT + '/ws',
    },
    documentation: 'https://github.com/yourrepo/trading-bot',
  });
});
// Definir una sola vez la función para reutilizarla en varios endpoints
const formatUptime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

// Health check ultra detallado
app.get('/health', async (req, res) => {
  try {
    logger.info('Ejecutando health check...');
    
    const health = await capitalService.healthCheck();
    const uptime = Math.floor((Date.now() - metrics.uptime.start) / 1000);
    
    const healthStatus = {
      success: health.success,
      status: health.success ? 'healthy' : 'degraded',
      uptime: {
        seconds: uptime,
        formatted: formatUptime(uptime),
      },
      services: {
        capitalApi: health,
        websocket: {
          status: wss.clients.size > 0 ? 'active' : 'idle',
          connections: wss.clients.size,
        },
      },
      system: {
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB',
        },
        cpu: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
      timestamp: new Date().toISOString(),
    };
    
    const statusCode = health.success ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Error en health check:', error.message);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Métricas del sistema ULTRA PRO MAX – Dashboard Ready
app.get('/metrics', (req, res) => {
  try {
    const uptimeSeconds = Math.floor((Date.now() - metrics.uptime.start) / 1000);
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();


    // Convertir bytes a MB con 2 decimales
    const formatBytes = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';


    // Validar que métricas existan para evitar errores
    const safeMetrics = (obj) => (obj && typeof obj === 'object' ? obj : {});


    res.status(200).json({
      success: true,
      system: {
        uptime: {
          seconds: uptimeSeconds,
          formatted: formatUptime(uptimeSeconds),
        },
        lastActivity: metrics.lastActivity,
        environment: NODE_ENV,
        process: {
          memory: {
            rss: formatBytes(memoryUsage.rss),
            heapTotal: formatBytes(memoryUsage.heapTotal),
            heapUsed: formatBytes(memoryUsage.heapUsed),
            external: formatBytes(memoryUsage.external),
            arrayBuffers: formatBytes(memoryUsage.arrayBuffers),
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system,
          },
        },
        websocket: {
          activeConnections: wss.clients.size,
          totalConnections: metrics.websocket.totalConnections || 0,
        },
      },
      metrics: {
        requests: safeMetrics(metrics.requests),
        orders: safeMetrics(metrics.orders),
        positions: safeMetrics(metrics.positions),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo métricas',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});


// =========================================
// 🧠 ENDPOINTS DE TRADING ULTRA PRO MAX
// =========================================

// ┌─────────────────────────────────────────┐
// │  🎯 CREAR ORDEN - ENDPOINT LETAL        │
// └─────────────────────────────────────────┘
app.post('/api/orders', async (req, res) => {
  const executionStart = Date.now();
  const requestId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { 
      type,           // BUY | SELL
      symbol,         // EURUSD, BTCUSD, etc.
      amount,         // Tamaño de la posición
      mode = 'demo',  // demo | live
      options = {},   // Opciones adicionales
      stopLoss,       // Stop Loss
      takeProfit,     // Take Profit
      trailingStop,   // Trailing Stop
      leverage,       // Apalancamiento
      notes          // Notas del trader
    } = req.body;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔍 VALIDACIÓN ULTRA ROBUSTA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const errors = [];
    
    if (!type || !['BUY', 'SELL'].includes(type.toUpperCase())) {
      errors.push({
        field: 'type',
        message: 'Tipo de orden debe ser BUY o SELL',
        received: type
      });
    }
    
    if (!symbol || typeof symbol !== 'string' || symbol.length < 3) {
      errors.push({
        field: 'symbol',
        message: 'Symbol inválido (mínimo 3 caracteres)',
        received: symbol
      });
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Amount debe ser un número positivo',
        received: amount
      });
    }

    if (stopLoss && stopLoss <= 0) {
      errors.push({
        field: 'stopLoss',
        message: 'Stop Loss debe ser positivo',
        received: stopLoss
      });
    }

    if (takeProfit && takeProfit <= 0) {
      errors.push({
        field: 'takeProfit',
        message: 'Take Profit debe ser positivo',
        received: takeProfit
      });
    }

    // Si hay errores, responder inmediatamente
    if (errors.length > 0) {
      logger.warn(`⚠️ [${requestId}] Validación fallida: ${errors.length} error(es)`);
      return res.status(400).json({
        success: false,
        requestId,
        error: 'Validación de parámetros fallida',
        details: errors,
        timestamp: new Date().toISOString(),
        executionTime: `${Date.now() - executionStart}ms`
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 PREPARAR DATA DE LA ORDEN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const orderData = {
      type: type.toUpperCase(),
      symbol: symbol.toUpperCase(),
      amount: parseFloat(amount),
      mode: mode.toLowerCase(),
      requestId,
      timestamp: new Date().toISOString(),
      source: 'api_ultra_pro',
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        notes: notes || null
      }
    };

    // Opciones avanzadas
    const enhancedOptions = {
      ...options,
      ...(stopLoss && { stopLoss: parseFloat(stopLoss) }),
      ...(takeProfit && { takeProfit: parseFloat(takeProfit) }),
      ...(trailingStop && { trailingStop: parseFloat(trailingStop) }),
      ...(leverage && { leverage: parseInt(leverage) }),
      requestId,
      createdAt: new Date().toISOString()
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 LOGGING PRE-EJECUCIÓN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    logger.trade(`
╔════════════════════════════════════════════╗
║  🎯 NUEVA ORDEN DETECTADA                  ║
╠════════════════════════════════════════════╣
║  ID       : ${requestId}                   
║  Tipo     : ${orderData.type}
║  Symbol   : ${orderData.symbol}
║  Amount   : ${orderData.amount}
║  Mode     : ${orderData.mode.toUpperCase()}
║  SL       : ${stopLoss || 'N/A'}
║  TP       : ${takeProfit || 'N/A'}
╚════════════════════════════════════════════╝
    `.trim());

    // Actualizar métricas
    updateMetrics('orders', 'total');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💎 EJECUTAR ORDEN EN CAPITAL SERVICE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const result = await capitalService.placeOrder(
      orderData.type,
      orderData.symbol,
      orderData.amount,
      orderData.mode,
      enhancedOptions
    );

    const executionTime = Date.now() - executionStart;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ RESPUESTA EXITOSA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (result.success) {
      updateMetrics('orders', 'success');
      updateMetrics('positions', 'opened');

      const successResponse = {
        success: true,
        requestId,
        orderId: result.orderId || result.dealId,
        dealReference: result.dealReference,
        status: 'EXECUTED',
        order: {
          type: orderData.type,
          symbol: orderData.symbol,
          amount: orderData.amount,
          mode: orderData.mode,
          stopLoss,
          takeProfit,
          trailingStop
        },
        execution: {
          price: result.level || result.price,
          timestamp: result.timestamp || new Date().toISOString(),
          executionTime: `${executionTime}ms`
        },
        metrics: {
          totalOrders: metrics.orders.total,
          successfulOrders: metrics.orders.success,
          successRate: `${((metrics.orders.success / metrics.orders.total) * 100).toFixed(2)}%`,
          activePositions: metrics.positions.opened - metrics.positions.closed
        }
      };

      logger.success(`
╔════════════════════════════════════════════╗
║  ✅ ORDEN EJECUTADA EXITOSAMENTE           ║
╠════════════════════════════════════════════╣
║  Request ID  : ${requestId}
║  Deal ID     : ${result.orderId || result.dealId}
║  Precio      : ${result.level || result.price || 'N/A'}
║  Tiempo      : ${executionTime}ms
║  Success Rate: ${successResponse.metrics.successRate}
╚════════════════════════════════════════════╝
      `.trim());

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📡 Broadcast a WebSocket clients
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      broadcast({
        type: 'order_placed',
        event: 'ORDER_EXECUTED',
        data: {
          requestId,
          orderId: result.orderId || result.dealId,
          symbol: orderData.symbol,
          type: orderData.type,
          amount: orderData.amount,
          price: result.level || result.price,
          mode: orderData.mode,
          executionTime: `${executionTime}ms`,
          timestamp: new Date().toISOString()
        },
        metrics: successResponse.metrics
      });

      return res.status(201).json(successResponse);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ❌ RESPUESTA DE ERROR CONTROLADO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    updateMetrics('orders', 'failed');

    const errorResponse = {
      success: false,
      requestId,
      status: 'FAILED',
      error: result.error || 'Error desconocido al ejecutar orden',
      details: result.details || result.message || 'No hay detalles adicionales',
      order: {
        type: orderData.type,
        symbol: orderData.symbol,
        amount: orderData.amount,
        mode: orderData.mode
      },
      execution: {
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`
      },
      troubleshooting: {
        possibleReasons: [
          'Símbolo no disponible',
          'Mercado cerrado',
          'Fondos insuficientes',
          'Parámetros inválidos',
          'Error de conexión con broker'
        ],
        suggestion: 'Verifica los parámetros y el estado de tu cuenta'
      }
    };

    logger.error(`
╔════════════════════════════════════════════╗
║  ❌ ERROR AL EJECUTAR ORDEN                ║
╠════════════════════════════════════════════╣
║  Request ID  : ${requestId}
║  Symbol      : ${orderData.symbol}
║  Error       : ${result.error || 'Desconocido'}
║  Tiempo      : ${executionTime}ms
╚════════════════════════════════════════════╝
    `.trim());

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📡 BROADCAST ERROR A WEBSOCKET CLIENTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    broadcast({
      type: 'order_failed',
      event: 'ORDER_EXECUTION_FAILED',
      severity: 'error',
      data: {
        requestId,
        symbol: orderData.symbol,
        type: orderData.type,
        amount: orderData.amount,
        mode: orderData.mode,
        error: result.error || 'Error desconocido al ejecutar orden',
        errorCode: result.errorCode || 'EXECUTION_ERROR',
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`
      },
      metrics: {
        totalOrders: metrics.orders.total,
        successfulOrders: metrics.orders.success,
        failedOrders: metrics.orders.failed,
        failureRate: `${((metrics.orders.failed / metrics.orders.total) * 100).toFixed(2)}%`
      }
    });

    return res.status(400).json(errorResponse);

  } catch (error) {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💥 MANEJO DE EXCEPCIONES CRÍTICAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const executionTime = Date.now() - executionStart;
    const errorStack = error.stack?.split('\n').slice(0, 3).join('\n') || 'Stack no disponible';
    
    updateMetrics('orders', 'failed');
    updateMetrics('api', 'errors');

    logger.error(`
╔════════════════════════════════════════════╗
║  💥 EXCEPCIÓN CRÍTICA EN /api/orders       ║
╠════════════════════════════════════════════╣
║  Request ID  : ${requestId}
║  Mensaje     : ${error.message}
║  Tipo        : ${error.name}
║  Tiempo      : ${executionTime}ms
║  Stack       : ${error.stack?.split('\n')[1]?.trim() || 'N/A'}
╚════════════════════════════════════════════╝
    `.trim());

    // Notificar error crítico via WebSocket
    broadcast({
      type: 'critical_error',
      event: 'SYSTEM_EXCEPTION',
      severity: 'critical',
      data: {
        requestId,
        error: error.message,
        errorType: error.name,
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`
      }
    });

    return res.status(500).json({
      success: false,
      status: 'CRITICAL_ERROR',
      requestId,
      error: 'Error interno del servidor',
      message: error.message,
      errorType: error.name,
      execution: {
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`
      },
      support: {
        message: 'Si el error persiste, contacta soporte técnico',
        requestId: requestId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// ┌─────────────────────────────────────────┐
// │  📍 OBTENER POSICIONES ABIERTAS         │
// └─────────────────────────────────────────┘
app.get('/api/positions', async (req, res) => {
  const executionStart = Date.now();
  const requestId = `POS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const mode = (req.query.mode || 'demo').toLowerCase();
    const includeHistory = req.query.history === 'true';
    const filterSymbol = req.query.symbol?.toUpperCase();
    const filterType = req.query.type?.toUpperCase(); // BUY | SELL
    const sortBy = req.query.sortBy || 'createdAt'; // createdAt | profit | symbol
    const sortOrder = req.query.sortOrder || 'desc'; // asc | desc

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔍 VALIDACIÓN DE PARÁMETROS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!['demo', 'live'].includes(mode)) {
      logger.warn(`⚠️ [${requestId}] Modo inválido: ${mode}`);
      return res.status(400).json({
        success: false,
        requestId,
        error: 'Parámetro "mode" debe ser "demo" o "live"',
        received: mode,
        timestamp: new Date().toISOString()
      });
    }

    updateMetrics('api', 'calls');

    logger.info(`
╔════════════════════════════════════════════╗
║  📍 CONSULTANDO POSICIONES                 ║
╠════════════════════════════════════════════╣
║  Request ID  : ${requestId}
║  Mode        : ${mode.toUpperCase()}
║  History     : ${includeHistory ? 'SÍ' : 'NO'}
║  Filter      : ${filterSymbol || 'TODOS'}
║  Sort        : ${sortBy} (${sortOrder})
╚════════════════════════════════════════════╝
    `.trim());

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💎 OBTENER POSICIONES DEL SERVICE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const result = await capitalService.getPositions(mode);
    const executionTime = Date.now() - executionStart;

    if (!result.success) {
      logger.error(`❌ [${requestId}] Error obteniendo posiciones: ${result.error}`);
      
      return res.status(400).json({
        success: false,
        requestId,
        status: 'FAILED',
        error: result.error || 'Error al obtener posiciones',
        details: result.details || 'No hay detalles adicionales',
        mode,
        execution: {
          timestamp: new Date().toISOString(),
          executionTime: `${executionTime}ms`
        }
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 PROCESAR Y FILTRAR POSICIONES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let positions = result.positions || [];

    // Filtrar por símbolo si se especifica
    if (filterSymbol) {
      positions = positions.filter(p => p.symbol === filterSymbol);
    }

    // Filtrar por tipo si se especifica
    if (filterType && ['BUY', 'SELL'].includes(filterType)) {
      positions = positions.filter(p => p.direction === filterType);
    }

    // Ordenar posiciones
    positions.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'profit') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 CALCULAR ESTADÍSTICAS AVANZADAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const profitable = positions.filter(p => (p.profit || 0) > 0);
    const losing = positions.filter(p => (p.profit || 0) < 0);
    const breakEven = positions.filter(p => (p.profit || 0) === 0);
    
    const totalPnL = positions.reduce((sum, p) => sum + (parseFloat(p.profit) || 0), 0);
    const totalSize = positions.reduce((sum, p) => sum + (parseFloat(p.size) || 0), 0);
    const avgPnL = positions.length > 0 ? totalPnL / positions.length : 0;
    
    const buyPositions = positions.filter(p => p.direction === 'BUY');
    const sellPositions = positions.filter(p => p.direction === 'SELL');

    // Agrupar por símbolo
    const bySymbol = positions.reduce((acc, p) => {
      const symbol = p.symbol;
      if (!acc[symbol]) {
        acc[symbol] = { count: 0, totalPnL: 0, positions: [] };
      }
      acc[symbol].count++;
      acc[symbol].totalPnL += parseFloat(p.profit) || 0;
      acc[symbol].positions.push(p);
      return acc;
    }, {});

    const stats = {
      total: positions.length,
      profitable: profitable.length,
      losing: losing.length,
      breakEven: breakEven.length,
      profitableRate: positions.length > 0 
        ? `${((profitable.length / positions.length) * 100).toFixed(2)}%`
        : '0%',
      pnl: {
        total: parseFloat(totalPnL.toFixed(2)),
        average: parseFloat(avgPnL.toFixed(2)),
        best: positions.length > 0
          ? parseFloat(Math.max(...positions.map(p => p.profit || 0)).toFixed(2))
          : 0,
        worst: positions.length > 0
          ? parseFloat(Math.min(...positions.map(p => p.profit || 0)).toFixed(2))
          : 0
      },
      directions: {
        buy: buyPositions.length,
        sell: sellPositions.length,
        buyPnL: parseFloat(buyPositions.reduce((sum, p) => sum + (p.profit || 0), 0).toFixed(2)),
        sellPnL: parseFloat(sellPositions.reduce((sum, p) => sum + (p.profit || 0), 0).toFixed(2))
      },
      exposure: {
        totalSize: parseFloat(totalSize.toFixed(2)),
        averageSize: positions.length > 0 
          ? parseFloat((totalSize / positions.length).toFixed(2))
          : 0
      },
      bySymbol: Object.keys(bySymbol).map(symbol => ({
        symbol,
        count: bySymbol[symbol].count,
        totalPnL: parseFloat(bySymbol[symbol].totalPnL.toFixed(2))
      })).sort((a, b) => b.totalPnL - a.totalPnL)
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ RESPUESTA EXITOSA CON ESTADÍSTICAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const successResponse = {
      success: true,
      requestId,
      status: 'SUCCESS',
      mode,
      filters: {
        symbol: filterSymbol || 'ALL',
        type: filterType || 'ALL',
        sortBy,
        sortOrder
      },
      data: {
        positions: positions.map(p => ({
          dealId: p.dealId,
          symbol: p.symbol,
          direction: p.direction,
          size: parseFloat(p.size),
          openLevel: parseFloat(p.openLevel || p.level),
          currentLevel: parseFloat(p.currentLevel || p.level),
          profit: parseFloat((p.profit || 0).toFixed(2)),
          profitPercentage: p.openLevel 
            ? `${(((p.currentLevel - p.openLevel) / p.openLevel) * 100).toFixed(2)}%`
            : '0%',
          stopLoss: p.stopLoss || null,
          takeProfit: p.limitLevel || p.takeProfit || null,
          createdAt: p.createdDateUTC || p.createdAt,
          currency: p.currency || 'USD'
        })),
        stats
      },
      execution: {
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`
      }
    };

    logger.success(`
╔════════════════════════════════════════════╗
║  ✅ POSICIONES OBTENIDAS EXITOSAMENTE      ║
╠════════════════════════════════════════════╣
║  Request ID  : ${requestId}
║  Total       : ${positions.length}
║  Profitable  : ${profitable.length} (${stats.profitableRate})
║  Losing      : ${losing.length}
║  P&L Total   : $${totalPnL.toFixed(2)}
║  Tiempo      : ${executionTime}ms
╚════════════════════════════════════════════╝
    `.trim());
// Función broadcast para emitir mensajes a todos los clientes conectados
const broadcast = (payload) => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(payload));
    }
  });
};
// 📡 BROADCAST SYSTEM - ULTRA PRODUCTION READY 🚀
const executeBroadcastPipeline = async ({
  result,
  orderData,
  executionTime = 0,
  successResponse = {},
  broadcastChecksum = null
}) => {
  const broadcastStartTime = performance.now();


  try {
    // ✅ Construcción de payload ULTRA optimizada y segura
    const broadcastPayload = Object.freeze({
      type: 'order_placed',
      event: 'ORDER_EXECUTED',
      version: '2.0',
       Object.freeze({
        requestId: orderData?.requestId || null,
        orderId: result?.orderId || result?.dealId || crypto.randomUUID(),
        dealReference: result?.dealReference || null,
        symbol: orderData?.symbol || null,
        side: (orderData?.type || '').toUpperCase(),
        quantity: parseFloat(orderData?.amount) || 0,
        executedPrice: parseFloat(result?.level || result?.price || 0),
        notionalValue: (parseFloat(orderData?.amount) || 0) * (parseFloat(result?.level || result?.price) || 0),
        slippage: result?.slippage ? parseFloat(result.slippage) : null,
        commission: parseFloat(result?.commission || 0),
        netProfit: result?.profit ? parseFloat(result.profit) : null,
        mode: orderData?.mode || 'demo',
        marketState: result?.marketStatus || 'OPEN',
        fillType: result?.fillType || 'FULL',
        venue: result?.venue || 'PRIMARY',
        executionTime: `${executionTime}ms`,
        serverTimestamp: new Date().toISOString(),
        epochMs: Date.now(),
        accountBalance: result?.accountBalance || null,
        marginUsed: result?.marginUsed || null,
        leverage: orderData?.leverage || 1
      }),
      metrics: Object.freeze({
        ...successResponse?.metrics,
        broadcast: {
          clientsActive: typeof getActiveWebSocketClients === 'function' ? getActiveWebSocketClients() : (wss?.clients?.size || 0),
          initiatedAt: broadcastStartTime,
          durationMs: parseFloat(performance.now() - broadcastStartTime).toFixed(2)
        },
        system: {
          memoryUsage: ((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)) + ' MB',
          uptime: formatUptime(process.uptime())
        }
      }),
      checksum: broadcastChecksum || null
    });


    // 🟢 Ultra Safe Broadcast & Logging
    broadcast(broadcastPayload);
    logger.info('Broadcast ejecutado:', {
      clients: broadcastPayload.metrics.broadcast.clientsActive,
      type: broadcastPayload.type,
      order: broadcastPayload.data.orderId,
      time: broadcastPayload.metrics.broadcast.durationMs + 'ms'
    });
  } catch (error) {
    logger.error('Error ULTRA en executeBroadcastPipeline:', error?.message || error);
  }
};


    // 🔐 Generar checksum SHA256
    const payloadString = JSON.stringify(broadcastPayload.data);
    broadcastPayload.checksum = crypto
      .createHash('sha256')
      .update(payloadString)
      .digest('hex')
      .substring(0, 16);

    // 🚀 ESTRATEGIA PRINCIPAL: WEBSOCKET
    setImmediate(async () => {
      try {
        const wsStart = performance.now();
        await broadcast(broadcastPayload);
        const wsLatency = (performance.now() - wsStart).toFixed(2);
        logger.info('📤 [WS] Broadcast exitoso', {
          orderId: broadcastPayload.data.orderId,
          clients: broadcastPayload.metrics.broadcast.clientsActive,
          latency: `${wsLatency}ms`
        });
      } catch (wsError) {
        logger.warn('⚠️ [WS] Falló broadcast WebSocket (no crítico)', {
          error: wsError.message,
          orderId: broadcastPayload.data.orderId
        });
      }
    });

    // 🚀 OPCIONAL: REDIS PUBLISH (si existe)
    if (global.redisPublisher) {
      setImmediate(async () => {
        try {
          await global.redisPublisher.publish('order:executed', JSON.stringify(broadcastPayload));
          logger.debug('📮 [REDIS] Publicado correctamente');
        } catch (redisError) {
          logger.warn('⚠️ [REDIS] Error publicando', { error: redisError.message });
        }
      });
    }

    // 🚀 OPCIONAL: EVENT QUEUE (si existe)
    if (global.eventQueue) {
      setImmediate(async () => {
        try {
          await global.eventQueue.enqueue('order_executed', broadcastPayload);
          logger.debug('📥 [QUEUE] Evento encolado');
        } catch (queueError) {
          logger.warn('⚠️ [QUEUE] Error encolando', { error: queueError.message });
        }
      });
    }

    // 🚀 OPCIONAL: AUDIT LOGGER (si existe)
    if (global.auditLogger) {
      setImmediate(() => {
        try {
          global.auditLogger.log('ORDER_BROADCAST', {
            orderId: broadcastPayload.data.orderId,
            symbol: broadcastPayload.data.symbol,
            side: broadcastPayload.data.side,
            quantity: broadcastPayload.data.quantity,
            price: broadcastPayload.data.executedPrice,
            checksum: broadcastPayload.checksum,
            timestamp: broadcastPayload.data.serverTimestamp
          });
        } catch (auditError) {
          logger.debug('⚠️ [AUDIT] No se pudo registrar', { reason: auditError.message });
        }
      });
    }

  } catch (fatalError) {
    // 🛡️ Modo emergencia
    logger.error('💀 [FATAL] Falló el pipeline completo', {
      error: fatalError.message,
      stack: fatalError.stack
    });

    try {
      broadcast({
        type: 'order_placed',
        event: 'ORDER_EXECUTED',
        data: {
          symbol: orderData.symbol,
          status: 'DEGRADED_MODE',
          timestamp: new Date().toISOString()
        },
        error: 'FATAL_BROADCAST_FALLBACK'
      });
    } catch (emergencyError) {
      logger.error('💀💀 Broadcast de emergencia también falló', {
        error: emergencyError.message
      });
    }
  }
};

// 🚀 Ejecutar broadcast pipeline sin bloquear respuesta
executeBroadcastPipeline().catch(err => {
  logger.error('🔥 Error no capturado en pipeline', { error: err.message });
});

// ✅ Respuesta HTTP inmediata al cliente
return res.status(201).json({
  ...successResponse,
  _meta: {
    broadcast: 'initiated',
    timestamp: new Date().toISOString(),
    activeClients: getActiveWebSocketClients?.() || 0
  }
});


// ┌─────────────────────────────────────────────────────────────────┐
// │  📍 OBTENER POSICIONES ABIERTAS - ULTRA PRO EDITION            │
// └─────────────────────────────────────────────────────────────────┘
app.get('/api/positions', async (req, res) => {
  const executionStart = performance.now();
  const requestId = `POS-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  
  // 🎯 Request Context
  const context = {
    requestId,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    startTime: new Date().toISOString()
  };

  try {
    // 📋 VALIDACIÓN Y SANITIZACIÓN DE PARÁMETROS
    const params = {
      mode: (req.query.mode || 'demo').toLowerCase().trim(),
      includeHistory: req.query.history === 'true',
      filterSymbol: req.query.symbol?.toUpperCase().trim(),
      filterType: req.query.type?.toUpperCase().trim(),
      sortBy: req.query.sortBy?.toLowerCase() || 'createdAt',
      sortOrder: req.query.sortOrder?.toLowerCase() || 'desc',
      limit: Math.min(parseInt(req.query.limit) || 100, 500), // Max 500
      offset: Math.max(parseInt(req.query.offset) || 0, 0),
      minProfit: req.query.minProfit ? parseFloat(req.query.minProfit) : null,
      maxProfit: req.query.maxProfit ? parseFloat(req.query.maxProfit) : null,
      groupBy: req.query.groupBy?.toLowerCase() // 'symbol', 'direction', etc.
    };

    // 🛡️ VALIDACIONES ROBUSTAS
    const validationErrors = [];

    if (!['demo', 'live'].includes(params.mode)) {
      validationErrors.push({
        field: 'mode',
        message: 'Debe ser "demo" o "live"',
        received: params.mode,
        expected: ['demo', 'live']
      });
    }

    if (params.filterType && !['BUY', 'SELL', 'LONG', 'SHORT'].includes(params.filterType)) {
      validationErrors.push({
        field: 'type',
        message: 'Debe ser BUY, SELL, LONG o SHORT',
        received: params.filterType
      });
    }

    const validSortFields = ['createdAt', 'profit', 'size', 'symbol', 'openLevel'];
    if (!validSortFields.includes(params.sortBy)) {
      validationErrors.push({
        field: 'sortBy',
        message: `Debe ser uno de: ${validSortFields.join(', ')}`,
        received: params.sortBy
      });
    }

    if (!['asc', 'desc'].includes(params.sortOrder)) {
      validationErrors.push({
        field: 'sortOrder',
        message: 'Debe ser "asc" o "desc"',
        received: params.sortOrder
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        requestId,
        status: 'VALIDATION_FAILED',
        errors: validationErrors,
        execution: {
          timestamp: new Date().toISOString(),
          executionTime: `${(performance.now() - executionStart).toFixed(2)}ms`
        }
      });
    }

    // 📊 MÉTRICAS Y RATE LIMITING
    updateMetrics('api', 'calls');
    updateMetrics('positions', 'requests');

    // Rate limiting check (opcional)
    if (global.rateLimiter) {
      const allowed = await global.rateLimiter.check(`positions:${context.ip}`, {
        max: 60, // 60 requests
        window: 60000 // por minuto
      });

      if (!allowed) {
        return res.status(429).json({
          success: false,
          requestId,
          status: 'RATE_LIMIT_EXCEEDED',
          error: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.',
          retryAfter: 60,
          execution: {
            timestamp: new Date().toISOString(),
            executionTime: `${(performance.now() - executionStart).toFixed(2)}ms`
          }
        });
      }
    }

    // 🚀 LLAMADA AL SERVICIO
    logger.info('📍 Fetching positions', {
      requestId,
      mode: params.mode,
      filters: {
        symbol: params.filterSymbol || 'all',
        type: params.filterType || 'all'
      }
    });

    const result = await capitalService.getPositions(params.mode);
    const serviceCallTime = (performance.now() - executionStart).toFixed(2);

    if (!result.success) {
      updateMetrics('positions', 'failures');
      
      return res.status(result.statusCode || 400).json({
        success: false,
        requestId,
        status: 'SERVICE_ERROR',
        error: result.error || 'Error al obtener posiciones',
        details: result.details || null,
        errorCode: result.errorCode || 'UNKNOWN_ERROR',
        mode: params.mode,
        execution: {
          timestamp: new Date().toISOString(),
          executionTime: `${serviceCallTime}ms`,
          serviceLatency: `${serviceCallTime}ms`
        }
      });
    }

    // 🎯 PROCESAMIENTO Y ENRIQUECIMIENTO DE DATOS
    let positions = Array.isArray(result.positions) ? result.positions : [];
    const rawCount = positions.length;

    // Filtros avanzados
    if (params.filterSymbol) {
      positions = positions.filter(p => p.symbol === params.filterSymbol);
    }

    if (params.filterType) {
      const normalizedType = params.filterType === 'LONG' ? 'BUY' : 
                            params.filterType === 'SHORT' ? 'SELL' : params.filterType;
      positions = positions.filter(p => p.direction === normalizedType);
    }

    if (params.minProfit !== null) {
      positions = positions.filter(p => (p.profit || 0) >= params.minProfit);
    }

    if (params.maxProfit !== null) {
      positions = positions.filter(p => (p.profit || 0) <= params.maxProfit);
    }

    // 🔄 ORDENAMIENTO ROBUSTO
    positions.sort((a, b) => {
      let aVal, bVal;

      switch (params.sortBy) {
        case 'profit':
          aVal = parseFloat(a.profit || 0);
          bVal = parseFloat(b.profit || 0);
          break;
        case 'size':
          aVal = parseFloat(a.size || 0);
          bVal = parseFloat(b.size || 0);
          break;
        case 'openLevel':
          aVal = parseFloat(a.openLevel || a.level || 0);
          bVal = parseFloat(b.openLevel || b.level || 0);
          break;
        case 'createdAt':
          aVal = new Date(a.createdDateUTC || a.createdAt || 0).getTime();
          bVal = new Date(b.createdDateUTC || b.createdAt || 0).getTime();
          break;
        case 'symbol':
          aVal = a.symbol || '';
          bVal = b.symbol || '';
          break;
        default:
          aVal = a[params.sortBy];
          bVal = b[params.sortBy];
      }

      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return params.sortOrder === 'asc' ? comparison : -comparison;
    });

    // 📄 PAGINACIÓN
    const totalFiltered = positions.length;
    const paginatedPositions = positions.slice(params.offset, params.offset + params.limit);

    // 📊 ESTADÍSTICAS AVANZADAS
    const stats = {
      total: totalFiltered,
      showing: paginatedPositions.length,
      offset: params.offset,
      limit: params.limit,
      hasMore: (params.offset + params.limit) < totalFiltered
    };

    if (positions.length > 0) {
      const profitable = positions.filter(p => (p.profit || 0) > 0);
      const losing = positions.filter(p => (p.profit || 0) < 0);
      const breakEven = positions.filter(p => (p.profit || 0) === 0);
      
      const totalPnL = positions.reduce((sum, p) => sum + (parseFloat(p.profit) || 0), 0);
      const avgPnL = totalPnL / positions.length;
      
      const profits = positions.map(p => parseFloat(p.profit) || 0);
      const maxProfit = Math.max(...profits);
      const minProfit = Math.min(...profits);
      
      const sizes = positions.map(p => parseFloat(p.size) || 0);
      const totalExposure = sizes.reduce((sum, s) => sum + s, 0);

      Object.assign(stats, {
        profitable: profitable.length,
        losing: losing.length,
        breakEven: breakEven.length,
        winRate: ((profitable.length / positions.length) * 100).toFixed(2) + '%',
        pnl: {
          total: parseFloat(totalPnL.toFixed(2)),
          average: parseFloat(avgPnL.toFixed(2)),
          max: parseFloat(maxProfit.toFixed(2)),
          min: parseFloat(minProfit.toFixed(2))
        },
        exposure: {
          total: parseFloat(totalExposure.toFixed(2)),
          average: parseFloat((totalExposure / positions.length).toFixed(2)),
          largest: parseFloat(Math.max(...sizes).toFixed(2))
        }
      });
    }

    // 🎨 AGRUPACIÓN (Si se solicita)
    let groupedData = null;
    if (params.groupBy && positions.length > 0) {
      groupedData = positions.reduce((acc, pos) => {
        const key = pos[params.groupBy] || 'unknown';
        if (!acc[key]) {
          acc[key] = {
            count: 0,
            totalPnL: 0,
            positions: []
          };
        }
        acc[key].count++;
        acc[key].totalPnL += parseFloat(pos.profit || 0);
        acc[key].positions.push(pos.dealId);
        return acc;
      }, {});
    }

    // 🎯 MAPEO DE POSICIONES CON DATOS ENRIQUECIDOS
    const enrichedPositions = paginatedPositions.map(p => {
      const openLevel = parseFloat(p.openLevel || p.level || 0);
      const currentLevel = parseFloat(p.currentLevel || p.level || 0);
      const size = parseFloat(p.size || 0);
      const profit = parseFloat(p.profit || 0);
      
      // Calcular métricas adicionales
      const priceChange = currentLevel - openLevel;
      const priceChangePercent = openLevel !== 0 ? ((priceChange / openLevel) * 100) : 0;
      const profitPercent = openLevel !== 0 ? ((profit / (openLevel * size)) * 100) : 0;

      return {
        dealId: p.dealId,
        symbol: p.symbol,
        direction: p.direction,
        size: parseFloat(size.toFixed(4)),
        openLevel: parseFloat(openLevel.toFixed(5)),
        currentLevel: parseFloat(currentLevel.toFixed(5)),
        profit: parseFloat(profit.toFixed(2)),
        profitPercent: parseFloat(profitPercent.toFixed(2)),
        priceChange: parseFloat(priceChange.toFixed(5)),
        priceChangePercent: parseFloat(priceChangePercent.toFixed(2)),
        stopLoss: p.stopLoss ? parseFloat(p.stopLoss) : null,
        takeProfit: p.limitLevel || p.takeProfit ? parseFloat(p.limitLevel || p.takeProfit) : null,
        createdAt: p.createdDateUTC || p.createdAt,
        currency: p.currency || 'USD',
        // 🆕 Datos adicionales
        riskRewardRatio: calculateRiskReward(p),
        durationMs: new Date() - new Date(p.createdDateUTC || p.createdAt),
        status: profit > 0 ? 'WINNING' : profit < 0 ? 'LOSING' : 'BREAKEVEN'
      };
    });

    // ⏱️ TIMING FINAL
    const executionTime = (performance.now() - executionStart).toFixed(2);

    // 📦 RESPUESTA EXITOSA
    const successResponse = {
      success: true,
      requestId,
      status: 'SUCCESS',
      mode: params.mode,
      data: {
        positions: enrichedPositions,
        stats,
        ...(groupedData && { grouped: groupedData }),
        filters: {
          symbol: params.filterSymbol || null,
          type: params.filterType || null,
          minProfit: params.minProfit,
          maxProfit: params.maxProfit
        },
        pagination: {
          offset: params.offset,
          limit: params.limit,
          total: totalFiltered,
          showing: paginatedPositions.length,
          hasMore: stats.hasMore
        }
      },
      metadata: {
        rawCount,
        filteredCount: totalFiltered,
        returnedCount: paginatedPositions.length,
        sortedBy: params.sortBy,
        sortOrder: params.sortOrder
      },
      execution: {
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`,
        serviceLatency: `${serviceCallTime}ms`,
        processingTime: `${(parseFloat(executionTime) - parseFloat(serviceCallTime)).toFixed(2)}ms`
      }
    };

    // 🔥 BROADCAST A WEBSOCKET (Si hay clientes conectados)
    if (global.broadcast && (global.getActiveWebSocketClients?.() || 0) > 0) {
      setImmediate(() => {
        try {
          global.broadcast({
            type: 'positions_fetched',
            event: 'POSITIONS_UPDATE',
            data: {
              mode: params.mode,
              count: totalFiltered,
              totalPnL: stats.pnl?.total || 0,
              timestamp: new Date().toISOString()
            }
          });
        } catch (wsError) {
          logger.debug('⚠️ WS broadcast skipped', { error: wsError.message });
        }
      });
    }

    // 📝 AUDIT LOG
    if (global.auditLogger) {
      setImmediate(() => {
        global.auditLogger.log('POSITIONS_FETCHED', {
          requestId,
          mode: params.mode,
          count: totalFiltered,
          executionTime,
          ip: context.ip
        });
      });
    }

    updateMetrics('positions', 'success');
    return res.status(200).json(successResponse);

  } catch (error) {
    const executionTime = (performance.now() - executionStart).toFixed(2);
    updateMetrics('api', 'errors');
    updateMetrics('positions', 'errors');

    logger.error('💥 Critical error fetching positions', {
      requestId,
      error: error.message,
      stack: error.stack,
      context
    });

    return res.status(500).json({
      success: false,
      status: 'CRITICAL_ERROR',
      requestId,
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      errorType: error.constructor.name,
      execution: {
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`
      }
    });
  }
});

// 🔧 HELPER: Calcular Risk/Reward Ratio
function calculateRiskReward(position) {
  try {
    if (!position.stopLoss || !position.takeProfit) return null;
    
    const entry = parseFloat(position.openLevel || position.level);
    const sl = parseFloat(position.stopLoss);
    const tp = parseFloat(position.takeProfit || position.limitLevel);
    
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    
    if (risk === 0) return null;
    return parseFloat((reward / risk).toFixed(2));
  } catch {
    return null;
  }
}

// ┌─────────────────────────────────────────────────────────────────┐
// │  ❌ CERRAR POSICIÓN ESPECÍFICA - ULTRA PRO EDITION             │
// └─────────────────────────────────────────────────────────────────┘
app.post('/api/positions/close', async (req, res) => {
  const executionStart = performance.now();
  const requestId = `CLOSE-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  
  // 🎯 Request Context
  const context = {
    requestId,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    startTime: new Date().toISOString()
  };

  try {
    // 📋 EXTRACCIÓN Y VALIDACIÓN DE PARÁMETROS
    const { 
      dealId, 
      mode = 'demo',
      size = null, // Cierre parcial
      reason = null // Razón del cierre
    } = req.body;

    const validationErrors = [];

    // Validación dealId
    if (!dealId) {
      validationErrors.push({
        field: 'dealId',
        message: 'Campo requerido',
        type: 'REQUIRED'
      });
    } else if (typeof dealId !== 'string' || dealId.trim().length === 0) {
      validationErrors.push({
        field: 'dealId',
        message: 'Debe ser un string no vacío',
        type: 'INVALID_TYPE',
        received: typeof dealId
      });
    }

    // Validación mode
    if (!['demo', 'live'].includes(mode.toLowerCase())) {
      validationErrors.push({
        field: 'mode',
        message: 'Debe ser "demo" o "live"',
        type: 'INVALID_VALUE',
        received: mode,
        expected: ['demo', 'live']
      });
    }

    // Validación size (si se proporciona)
    if (size !== null) {
      const parsedSize = parseFloat(size);
      if (isNaN(parsedSize) || parsedSize <= 0) {
        validationErrors.push({
          field: 'size',
          message: 'Debe ser un número mayor a 0',
          type: 'INVALID_VALUE',
          received: size
        });
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        requestId,
        status: 'VALIDATION_FAILED',
        errors: validationErrors,
        execution: {
          timestamp: new Date().toISOString(),
          executionTime: `${(performance.now() - executionStart).toFixed(2)}ms`
        }
      });
    }

    // 🔒 CONFIRMACIÓN DE MODO LIVE (Safety Check)
    if (mode.toLowerCase() === 'live' && !req.body.confirmed) {
      return res.status(403).json({
        success: false,
        requestId,
        status: 'CONFIRMATION_REQUIRED',
        message: 'Cierre en modo LIVE requiere confirmación explícita',
        instruction: 'Incluye "confirmed: true" en el body para proceder',
        dealId,
        execution: {
          timestamp: new Date().toISOString(),
          executionTime: `${(performance.now() - executionStart).toFixed(2)}ms`
        }
      });
    }

    // 📊 MÉTRICAS
    updateMetrics('api', 'calls');
    updateMetrics('positions', 'close_attempts');

    // 🔍 VERIFICAR QUE LA POSICIÓN EXISTE (Pre-check)
    logger.info('❌ Attempting to close position', {
      requestId,
      dealId: dealId.trim(),
      mode: mode.toLowerCase(),
      partialClose: size !== null,
      reason: reason || 'Not specified'
    });

    let positionData = null;
    try {
      const positionsResult = await capitalService.getPositions(mode.toLowerCase());
      if (positionsResult.success && positionsResult.positions) {
        positionData = positionsResult.positions.find(p => p.dealId === dealId.trim());
        
        if (!positionData) {
          return res.status(404).json({
            success: false,
            requestId,
            status: 'POSITION_NOT_FOUND',
            error: `No se encontró posición con dealId: ${dealId}`,
            dealId: dealId.trim(),
            mode: mode.toLowerCase(),
            suggestion: 'Verifica que el dealId sea correcto y que la posición esté abierta',
            execution: {
              timestamp: new Date().toISOString(),
              executionTime: `${(performance.now() - executionStart).toFixed(2)}ms`
            }
          });
        }
      }
    } catch (preCheckError) {
      logger.warn('⚠️ Pre-check failed, proceeding anyway', {
        error: preCheckError.message,
        requestId
      });
    }

    // 🚀 CERRAR POSICIÓN
    const closeParams = {
      dealId: dealId.trim(),
      size: size ? parseFloat(size) : null
    };

    const result = await capitalService.closePosition(
      closeParams.dealId,
      mode.toLowerCase(),
      closeParams.size
    );

    const serviceCallTime = (performance.now() - executionStart).toFixed(2);

    // 💥 MANEJO DE ERRORES DEL SERVICIO
    if (!result.success) {
      updateMetrics('positions', 'close_failures');
      
      const errorResponse = {
        success: false,
        requestId,
        status: 'CLOSE_FAILED',
        error: result.error || 'Error al cerrar posición',
        details: result.details || null,
        errorCode: result.errorCode || 'UNKNOWN_ERROR',
        dealId: closeParams.dealId,
        mode: mode.toLowerCase(),
        execution: {
          timestamp: new Date().toISOString(),
          executionTime: `${serviceCallTime}ms`
        }
      };

      // Logging específico por tipo de error
      if (result.errorCode === 'POSITION_NOT_FOUND') {
        logger.warn('⚠️ Position not found', { requestId, dealId: closeParams.dealId });
        return res.status(404).json(errorResponse);
      } else if (result.errorCode === 'MARKET_CLOSED') {
        logger.warn('⚠️ Market closed', { requestId, dealId: closeParams.dealId });
        return res.status(422).json(errorResponse);
      } else {
        logger.error('❌ Close position failed', {
          requestId,
          dealId: closeParams.dealId,
          error: result.error,
          errorCode: result.errorCode
        });
        return res.status(400).json(errorResponse);
      }
    }

    // ✅ CIERRE EXITOSO
    updateMetrics('positions', 'close_success');

    const executionTime = (performance.now() - executionStart).toFixed(2);

    // 📦 CALCULAR MÉTRICAS DE CIERRE
    const closeMetrics = {};
    if (positionData) {
      const holdDuration = new Date() - new Date(positionData.createdDateUTC || positionData.createdAt);
      const finalProfit = parseFloat(result.profit || positionData.profit || 0);
      
      Object.assign(closeMetrics, {
        openedAt: positionData.createdDateUTC || positionData.createdAt,
        closedAt: new Date().toISOString(),
        holdDuration: {
          ms: holdDuration,
          seconds: Math.floor(holdDuration / 1000),
          minutes: Math.floor(holdDuration / 60000),
          hours: parseFloat((holdDuration / 3600000).toFixed(2))
        },
        position: {
          symbol: positionData.symbol,
          direction: positionData.direction,
          size: parseFloat(positionData.size || 0),
          openLevel: parseFloat(positionData.openLevel || positionData.level || 0),
          closeLevel: parseFloat(result.closeLevel || positionData.currentLevel || 0)
        },
        pnl: {
          gross: parseFloat(finalProfit.toFixed(2)),
          currency: positionData.currency || 'USD'
        }
      });
    }

    const successResponse = {
      success: true,
      requestId,
      status: 'POSITION_CLOSED',
      dealId: closeParams.dealId,
      mode: mode.toLowerCase(),
      closeType: size ? 'PARTIAL' : 'FULL',
      ...(size && { closedSize: parseFloat(size) }),
      ...(reason && { reason }),
      ...(Object.keys(closeMetrics).length > 0 && { metrics: closeMetrics }),
      execution: {
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`,
        serviceLatency: `${serviceCallTime}ms`
      }
    };

    // 🔥 BROADCAST A WEBSOCKET
    if (global.broadcast) {
      setImmediate(() => {
        try {
          global.broadcast({
            type: 'position_closed',
            event: 'POSITION_CLOSED',
            data: {
              requestId,
              dealId: closeParams.dealId,
              mode: mode.toLowerCase(),
              profit: closeMetrics.pnl?.gross || null,
              symbol: closeMetrics.position?.symbol || null,
              timestamp: new Date().toISOString()
            }
          });
        } catch (wsError) {
          logger.debug('⚠️ WS broadcast skipped', { error: wsError.message });
        }
      });
    }

    // 📝 AUDIT LOG
    if (global.auditLogger) {
      setImmediate(() => {
        global.auditLogger.log('POSITION_CLOSED', {
          requestId,
          dealId: closeParams.dealId,
          mode: mode.toLowerCase(),
          profit: closeMetrics.pnl?.gross || null,
          reason: reason || 'Manual close',
          executionTime,
          ip: context.ip
        });
      });
    }

    logger.info('✅ Position closed successfully', {
      requestId,
      dealId: closeParams.dealId,
      profit: closeMetrics.pnl?.gross || null,
      executionTime: `${executionTime}ms`
    });

    return res.status(200).json(successResponse);

  } catch (error) {
    const executionTime = (performance.now() - executionStart).toFixed(2);
    updateMetrics('api', 'errors');
    updateMetrics('positions', 'close_errors');

    logger.error('💥 Critical error closing position', {
      requestId,
      dealId: req.body.dealId,
      error: error.message,
      stack: error.stack,
      context
    });

    return res.status(500).json({
      success: false,
      status: 'CRITICAL_ERROR',
      requestId,
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      errorType: error.constructor.name,
      dealId: req.body.dealId,
      execution: {
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`
      }
    });
  }
});


// ┌─────────────────────────────────────────────────────────────────┐
// │  📒 INFORMACIÓN DE CUENTA - ULTRA PRO EDITION                   │
// └─────────────────────────────────────────────────────────────────┘
app.get('/api/account', async (req, res) => {
  const executionStart = performance.now();
  const requestId = `ACC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  
  // 🎯 Request Context
  const context = {
    requestId,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    startTime: new Date().toISOString()
  };

  try {
    // 📋 VALIDACIÓN Y PARÁMETROS
    const params = {
      mode: (req.query.mode || 'demo').toLowerCase().trim(),
      includeMetrics: req.query.metrics === 'true',
      includePositions: req.query.positions === 'true',
      includeHistory: req.query.history === 'true',
      currency: (req.query.currency || 'USD').toUpperCase()
    };

    // 🛡️ VALIDACIONES
    if (!['demo', 'live'].includes(params.mode)) {
      return res.status(400).json({
        success: false,
        requestId,
        status: 'VALIDATION_FAILED',
        errors: [{
          field: 'mode',
          message: 'Debe ser "demo" o "live"',
          received: params.mode,
          expected: ['demo', 'live']
        }],
        execution: {
          timestamp: new Date().toISOString(),
          executionTime: `${(performance.now() - executionStart).toFixed(2)}ms`
        }
      });
    }

    // 📊 MÉTRICAS Y RATE LIMITING
    updateMetrics('api', 'calls');
    updateMetrics('account', 'requests');

    // Rate limiting check
    if (global.rateLimiter) {
      const allowed = await global.rateLimiter.check(`account:${context.ip}`, {
        max: 30, // 30 requests
        window: 60000 // por minuto (menos permisivo que positions)
      });

      if (!allowed) {
        return res.status(429).json({
          success: false,
          requestId,
          status: 'RATE_LIMIT_EXCEEDED',
          error: 'Demasiadas solicitudes a /account. Intenta de nuevo en 1 minuto.',
          retryAfter: 60,
          execution: {
            timestamp: new Date().toISOString(),
            executionTime: `${(performance.now() - executionStart).toFixed(2)}ms`
          }
        });
      }
    }

    // 🚀 LLAMADA AL SERVICIO
    logger.info('📒 Fetching account info', {
      requestId,
      mode: params.mode,
      includeExtras: {
        metrics: params.includeMetrics,
        positions: params.includePositions,
        history: params.includeHistory
      }
    });

    const accountData = await capitalService.getAccountInfo(params.mode);
    const serviceCallTime = (performance.now() - executionStart).toFixed(2);

    if (!accountData || !accountData.success) {
      updateMetrics('account', 'failures');
      
      return res.status(accountData?.statusCode || 400).json({
        success: false,
        requestId,
        status: 'SERVICE_ERROR',
        error: accountData?.error || 'Error al obtener información de cuenta',
        details: accountData?.details || null,
        errorCode: accountData?.errorCode || 'ACCOUNT_FETCH_FAILED',
        mode: params.mode,
        execution: {
          timestamp: new Date().toISOString(),
          executionTime: `${serviceCallTime}ms`
        }
      });
    }

    // 🎯 ENRIQUECIMIENTO DE DATOS DE CUENTA
    const enrichedAccount = {
      accountId: accountData.accountId,
      accountName: accountData.accountName || 'N/A',
      accountType: accountData.accountType || params.mode.toUpperCase(),
      status: accountData.status || 'ACTIVE',
      
      // 💰 BALANCE Y FONDOS
      balance: {
        available: parseFloat((accountData.balance || 0).toFixed(2)),
        deposit: parseFloat((accountData.deposit || 0).toFixed(2)),
        profitLoss: parseFloat((accountData.profitLoss || 0).toFixed(2)),
        currency: accountData.currency || params.currency
      },
      
      // 📊 MÉTRICAS DE TRADING (si está disponible)
      ...(accountData.equity && {
        equity: parseFloat(accountData.equity.toFixed(2))
      }),
      
      ...(accountData.available && {
        availableToTrade: parseFloat(accountData.available.toFixed(2))
      }),
      
      // 🎚️ MARGIN Y APALANCAMIENTO
      ...(accountData.margin && {
        margin: {
          used: parseFloat((accountData.margin.used || 0).toFixed(2)),
          available: parseFloat((accountData.margin.available || 0).toFixed(2)),
          level: accountData.margin.level ? 
            parseFloat(accountData.margin.level.toFixed(2)) : null
        }
      })
    };

    // 🔥 DATOS ADICIONALES OPCIONALES
    const additionalData = {};

    // Métricas extendidas
    if (params.includeMetrics && accountData.balance) {
      const balance = parseFloat(accountData.balance || 0);
      const profitLoss = parseFloat(accountData.profitLoss || 0);
      const deposit = parseFloat(accountData.deposit || 0);
      
      additionalData.performance = {
        totalReturn: deposit !== 0 ? 
          parseFloat(((profitLoss / deposit) * 100).toFixed(2)) : 0,
        totalReturnPercent: deposit !== 0 ? 
          `${((profitLoss / deposit) * 100).toFixed(2)}%` : '0%',
        roi: deposit !== 0 ? 
          parseFloat(((balance - deposit) / deposit * 100).toFixed(2)) : 0,
        profitFactor: profitLoss > 0 ? 
          parseFloat((balance / deposit).toFixed(2)) : 0
      };
    }

    // Posiciones abiertas
    if (params.includePositions) {
      try {
        const positionsResult = await capitalService.getPositions(params.mode);
        if (positionsResult.success && positionsResult.positions) {
          const positions = positionsResult.positions;
          const totalPnL = positions.reduce((sum, p) => 
            sum + (parseFloat(p.profit) || 0), 0
          );
          
          additionalData.openPositions = {
            count: positions.length,
            totalPnL: parseFloat(totalPnL.toFixed(2)),
            symbols: [...new Set(positions.map(p => p.symbol))],
            exposure: positions.reduce((sum, p) => 
              sum + (parseFloat(p.size) || 0) * (parseFloat(p.openLevel) || 0), 0
            ).toFixed(2)
          };
        }
      } catch (posError) {
        logger.warn('⚠️ Failed to fetch positions for account', {
          error: posError.message,
          requestId
        });
        additionalData.openPositions = { error: 'Unable to fetch positions' };
      }
    }

    // Historial de trading (simulado - implementar según API real)
    if (params.includeHistory) {
      additionalData.tradingHistory = {
        available: false,
        message: 'Historial de trading disponible en endpoint dedicado',
        endpoint: '/api/history'
      };
    }

    // 🎨 CALCULAR HEALTH SCORE
    const healthScore = calculateAccountHealth(enrichedAccount);

    // ⏱️ TIMING FINAL
    const executionTime = (performance.now() - executionStart).toFixed(2);

    // 📦 RESPUESTA EXITOSA
    const successResponse = {
      success: true,
      requestId,
      status: 'SUCCESS',
      mode: params.mode,
      data: {
        account: enrichedAccount,
        ...additionalData,
        health: healthScore
      },
      metadata: {
        dataFreshness: 'REAL_TIME',
        lastUpdate: new Date().toISOString(),
        includesExtras: {
          metrics: params.includeMetrics,
          positions: params.includePositions,
          history: params.includeHistory
        }
      },
      execution: {
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`,
        serviceLatency: `${serviceCallTime}ms`,
        processingTime: `${(parseFloat(executionTime) - parseFloat(serviceCallTime)).toFixed(2)}ms`
      }
    };

    // 🔥 BROADCAST A WEBSOCKET
    if (global.broadcast && (global.getActiveWebSocketClients?.() || 0) > 0) {
      setImmediate(() => {
        try {
          global.broadcast({
            type: 'account_fetched',
            event: 'ACCOUNT_UPDATE',
            data: {
              mode: params.mode,
              balance: enrichedAccount.balance.available,
              profitLoss: enrichedAccount.balance.profitLoss,
              healthScore: healthScore.score,
              timestamp: new Date().toISOString()
            }
          });
        } catch (wsError) {
          logger.debug('⚠️ WS broadcast skipped', { error: wsError.message });
        }
      });
    }

    // 📝 AUDIT LOG
    if (global.auditLogger) {
      setImmediate(() => {
        global.auditLogger.log('ACCOUNT_ACCESSED', {
          requestId,
          mode: params.mode,
          balance: enrichedAccount.balance.available,
          ip: context.ip,
          executionTime
        });
      });
    }

    updateMetrics('account', 'success');
    return res.status(200).json(successResponse);

  } catch (error) {
    const executionTime = (performance.now() - executionStart).toFixed(2);
    updateMetrics('api', 'errors');
    updateMetrics('account', 'errors');

    logger.error('💥 Critical error fetching account info', {
      requestId,
      error: error.message,
      stack: error.stack,
      context
    });

    return res.status(500).json({
      success: false,
      status: 'CRITICAL_ERROR',
      requestId,
      error: process.env.NODE_ENV === 'production' ? 
        'Internal server error' : error.message,
      errorType: error.constructor.name,
      execution: {
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`
      }
    });
  }
});

// 🔧 HELPER: Calcular Account Health Score
function calculateAccountHealth(account) {
  try {
    const balance = account.balance.available || 0;
    const profitLoss = account.balance.profitLoss || 0;
    const deposit = account.balance.deposit || 1; // Evitar división por 0
    
    let score = 100;
    let status = 'EXCELLENT';
    const warnings = [];
    const recommendations = [];

    // Factor 1: Balance vs Deposit
    const balanceRatio = balance / deposit;
    if (balanceRatio < 0.5) {
      score -= 40;
      warnings.push('Balance muy bajo comparado con depósito inicial');
      recommendations.push('Considera depositar más fondos o reducir exposición');
    } else if (balanceRatio < 0.8) {
      score -= 20;
      warnings.push('Balance reducido');
    }

    // Factor 2: Profit/Loss
    if (profitLoss < 0) {
      const lossPercent = Math.abs(profitLoss / deposit * 100);
      if (lossPercent > 50) {
        score -= 30;
        warnings.push(`Pérdidas superiores al 50% (${lossPercent.toFixed(2)}%)`);
        recommendations.push('Revisa tu estrategia de trading urgentemente');
      } else if (lossPercent > 25) {
        score -= 15;
        warnings.push(`Pérdidas significativas (${lossPercent.toFixed(2)}%)`);
      }
    }

    // Factor 3: Margin (si está disponible)
    if (account.margin?.level) {
      const marginLevel = account.margin.level;
      if (marginLevel < 100) {
        score -= 25;
        warnings.push('Nivel de margen crítico');
        recommendations.push('Cierra posiciones o deposita fondos inmediatamente');
      } else if (marginLevel < 200) {
        score -= 10;
        warnings.push('Nivel de margen bajo');
        recommendations.push('Monitorea tus posiciones de cerca');
      }
    }

    // Determinar status
    if (score >= 80) status = 'EXCELLENT';
    else if (score >= 60) status = 'GOOD';
    else if (score >= 40) status = 'WARNING';
    else if (score >= 20) status = 'CRITICAL';
    else status = 'DANGER';

    return {
      score: Math.max(0, Math.min(100, score)),
      status,
      warnings: warnings.length > 0 ? warnings : ['Ninguna'],
      recommendations: recommendations.length > 0 ? recommendations : ['Continúa operando con prudencia']
    };
  } catch (error) {
    return {
      score: 50,
      status: 'UNKNOWN',
      warnings: ['No se pudo calcular health score'],
      recommendations: ['Verifica los datos de tu cuenta']
    };
  }
}

// ┌─────────────────────────────────────────────────────────────────┐
// │  🔌 HEALTH CHECK - ULTRA PRO EDITION                            │
// └─────────────────────────────────────────────────────────────────┘
app.get('/api/health', async (req, res) => {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();
  const requestId = `HEALTH-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  try {
    // 🎯 Nivel de detalle del health check
    const detailed = req.query.detailed === 'true';
    const checkServices = req.query.services === 'true';

    // ⚡ CHECKS BÁSICOS
    const basicHealth = {
      api: 'OPERATIONAL',
      uptime: process.uptime(),
      uptimeFormatted: formatUptime(process.uptime()),
      timestamp,
      requestId
    };

    // 🔍 CHECKS DETALLADOS (si se solicitan)
    if (detailed) {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      basicHealth.system = {
        memory: {
          used: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          total: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          usagePercent: `${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)}%`,
          rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`
        },
        cpu: {
          user: `${(cpuUsage.user / 1000).toFixed(2)} ms`,
          system: `${(cpuUsage.system / 1000).toFixed(2)} ms`
        },
        process: {
          pid: process.pid,
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        }
      };

      // Métricas de API (si existen)
      if (global.metrics) {
        basicHealth.metrics = {
          api: {
            calls: global.metrics.api?.calls || 0,
            errors: global.metrics.api?.errors || 0,
            errorRate: global.metrics.api?.calls ? 
              `${((global.metrics.api.errors / global.metrics.api.calls) * 100).toFixed(2)}%` : '0%'
          },
          orders: {
            placed: global.metrics.orders?.placed || 0,
            success: global.metrics.orders?.success || 0,
            failed: global.metrics.orders?.failed || 0,
            successRate: global.metrics.orders?.placed ?
              `${((global.metrics.orders.success / global.metrics.orders.placed) * 100).toFixed(2)}%` : '0%'
          }
        };
      }

      // WebSocket status
      if (global.getActiveWebSocketClients) {
        basicHealth.websocket = {
          status: 'ENABLED',
          activeClients: global.getActiveWebSocketClients() || 0,
          totalClients: global.getTotalWebSocketClients?.() || 0
        };
      }
    }

    // 🧪 CHECKS DE SERVICIOS EXTERNOS (si se solicitan)
    if (checkServices) {
      const servicesHealth = {};

      // Check Capital.com API
      try {
        const capitalCheck = await Promise.race([
          capitalService.testConnection?.() || Promise.resolve({ success: true }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ]);

        servicesHealth.capitalApi = {
          status: capitalCheck.success ? 'CONNECTED' : 'DEGRADED',
          latency: capitalCheck.latency || 'N/A',
          lastCheck: new Date().toISOString()
        };
      } catch (error) {
        servicesHealth.capitalApi = {
          status: 'DISCONNECTED',
          error: error.message,
          lastCheck: new Date().toISOString()
        };
      }

      // Check Redis (si está configurado)
      if (global.redisClient) {
        try {
          const redisStart = performance.now();
          await global.redisClient.ping();
          const redisLatency = (performance.now() - redisStart).toFixed(2);
          
          servicesHealth.redis = {
            status: 'CONNECTED',
            latency: `${redisLatency}ms`,
            lastCheck: new Date().toISOString()
          };
        } catch (error) {
          servicesHealth.redis = {
            status: 'DISCONNECTED',
            error: error.message,
            lastCheck: new Date().toISOString()
          };
        }
      }

      // Check Database (si está configurado)
      if (global.database) {
        try {
          const dbStart = performance.now();
          await global.database.ping?.();
          const dbLatency = (performance.now() - dbStart).toFixed(2);
          
          servicesHealth.database = {
            status: 'CONNECTED',
            latency: `${dbLatency}ms`,
            lastCheck: new Date().toISOString()
          };
        } catch (error) {
          servicesHealth.database = {
            status: 'DISCONNECTED',
            error: error.message,
            lastCheck: new Date().toISOString()
          };
        }
      }

      basicHealth.services = servicesHealth;
    }

    // 🎯 CALCULAR STATUS GENERAL
    let overallStatus = 'HEALTHY';
    const issues = [];

    // Check memory usage
    if (detailed) {
      const memPercent = (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100;
      if (memPercent > 90) {
        overallStatus = 'DEGRADED';
        issues.push('High memory usage (>90%)');
      } else if (memPercent > 80) {
        issues.push('Elevated memory usage (>80%)');
      }
    }

    // Check services
    if (checkServices && basicHealth.services) {
      const servicesDown = Object.values(basicHealth.services)
        .filter(s => s.status === 'DISCONNECTED').length;
      
      if (servicesDown > 0) {
        overallStatus = servicesDown === Object.keys(basicHealth.services).length ? 
          'CRITICAL' : 'DEGRADED';
        issues.push(`${servicesDown} service(s) disconnected`);
      }
    }

    const executionTime = (performance.now() - startTime).toFixed(2);

    // 📦 RESPUESTA
    const response = {
      success: true,
      status: overallStatus,
      ...basicHealth,
      ...(issues.length > 0 && { issues }),
      execution: {
        responseTime: `${executionTime}ms`,
        timestamp
      }
    };

    // 📊 Status Code según health
    const statusCode = overallStatus === 'HEALTHY' ? 200 :
                      overallStatus === 'DEGRADED' ? 200 :
                      overallStatus === 'CRITICAL' ? 503 : 200;

    return res.status(statusCode).json(response);

  } catch (error) {
    const executionTime = (performance.now() - startTime).toFixed(2);

    logger.error('💥 Health check failed', {
      requestId,
      error: error.message,
      stack: error.stack
    });

    return res.status(503).json({
      success: false,
      status: 'UNHEALTHY',
      error: error.message,
      requestId,
      execution: {
        responseTime: `${executionTime}ms`,
        timestamp
      }
    });
  }
});

// 🔧 HELPER: Format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}


// ===========================================================
// 🔌 WEBSOCKET LEGENDARIO CON ARQUITECTURA PRO
// ===========================================================
// 🎯 CONFIGURACIÓN AVANZADA
const WS_CONFIG = {
  heartbeat: {
    interval: 30000, // 30s
    timeout: 35000,  // 35s - grace period
    maxMissed: 3     // Máximo de pings sin respuesta
  },
  limits: {
    maxConnections: 1000,
    maxSubscriptions: 50,
    messageRateLimit: 100, // mensajes por minuto
    maxMessageSize: 1024 * 100 // 100KB
  },
  reconnect: {
    enabled: true,
    maxAttempts: 5,
    backoffMs: 1000
  }
};
// 📊 STORAGE DE CLIENTES MEJORADO
const clientsStore = new Map();
class WebSocketClient {
  constructor(ws, req) {
    this.id = `WS-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    this.ws = ws;
    this.ip = extractClientIP(req);
    this.userAgent = req.headers['user-agent'];
    this.connectedAt = Date.now();
    this.lastActivity = Date.now();
    this.isAlive = true;
    this.missedPings = 0;
    this.subscriptions = new Set();
    this.messageCount = 0;
    this.messageTimestamps = [];
    this.metadata = {};
  }
  isRateLimited() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Limpiar timestamps antiguos
    this.messageTimestamps = this.messageTimestamps.filter(t => t > oneMinuteAgo);
    
    return this.messageTimestamps.length >= WS_CONFIG.limits.messageRateLimit;
  }
  recordMessage() {
    this.messageCount++;
    this.messageTimestamps.push(Date.now());
    this.lastActivity = Date.now();
  }
  getConnectionDuration() {
    return Date.now() - this.connectedAt;
  }
  toJSON() {
    return {
      id: this.id,
      ip: this.ip,
      connectedAt: new Date(this.connectedAt).toISOString(),
      duration: formatDuration(this.getConnectionDuration()),
      subscriptions: Array.from(this.subscriptions),
      messageCount: this.messageCount,
      isAlive: this.isAlive,
      lastActivity: new Date(this.lastActivity).toISOString()
    };
  }
}
// 🛡️ HELPER: Extract Client IP
function extractClientIP(req) {
  return req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.socket.remoteAddress ||
         'unknown';
}
// 🎯 CONNECTION HANDLER LEGENDARIO
wss.on('connection', async (ws, req) => {
  const startTime = performance.now();
  try {
    // 🔒 CHECK: Max connections
    if (clientsStore.size >= WS_CONFIG.limits.maxConnections) {
      ws.close(1008, 'Server at capacity');
      logger.warn('🚫 WebSocket connection rejected: Server at capacity');
      return;
    }
    // 🎯 CREAR CLIENTE
    const client = new WebSocketClient(ws, req);
    clientsStore.set(client.id, client);
    ws.clientInstance = client;
    // 📊 MÉTRICAS
    updateMetrics('websocket', 'connected');
    updateMetrics('websocket', 'totalConnections');
    const setupTime = (performance.now() - startTime).toFixed(2);
    logger.info('🔌 WebSocket client connected', {
      clientId: client.id,
      ip: client.ip,
      totalClients: clientsStore.size,
      setupTime: `${setupTime}ms`
    });
    // 🎉 MENSAJE DE BIENVENIDA MEJORADO
    const welcomeMessage = {
      type: 'welcome',
      event: 'CONNECTION_ESTABLISHED',
      data: {
        clientId: client.id,
        serverVersion: '2.0.0',
        capabilities: [
          'real-time-orders',
          'position-updates',
          'market-data',
          'account-updates',
          'metrics-streaming'
        ],
        config: {
          heartbeatInterval: WS_CONFIG.heartbeat.interval,
          maxSubscriptions: WS_CONFIG.limits.maxSubscriptions,
          rateLimit: WS_CONFIG.limits.messageRateLimit
        }
      },
      timestamp: new Date().toISOString(),
      serverTime: Date.now()
    };
    ws.send(JSON.stringify(welcomeMessage));
    // 🔄 HEARTBEAT - Pong Response
    ws.on('pong', () => {
      client.isAlive = true;
      client.missedPings = 0;
      client.lastActivity = Date.now();
    });
    // 📨 MESSAGE HANDLER ULTRA PRO
    ws.on('message', async (raw) => {
      const msgStartTime = performance.now();
      try {
        // 🛡️ SIZE CHECK
        if (raw.length > WS_CONFIG.limits.maxMessageSize) {
          sendError(ws, 'Message too large', {
            maxSize: WS_CONFIG.limits.maxMessageSize,
            receivedSize: raw.length
          });
          return;
        }
        // 🛡️ RATE LIMIT CHECK
        if (client.isRateLimited()) {
          sendError(ws, 'Rate limit exceeded', {
            limit: WS_CONFIG.limits.messageRateLimit,
            window: '60 seconds'
          });
          return;
        }
        client.recordMessage();
        // 📋 PARSE MESSAGE
        const message = JSON.parse(raw.toString());
        const { type, data } = message;
        logger.debug('📥 WS Message received', {
          clientId: client.id,
          type: type || 'unknown',
          size: raw.length
        });
        // 🎯 ROUTER DE MENSAJES
        let response;
        switch (type) {
          case 'ping':
            response = {
              type: 'pong',
              timestamp: Date.now(),
              clientTime: data?.timestamp || null,
              latency: data?.timestamp ? Date.now() - data.timestamp : null
            };
            break;
          case 'subscribe':
            response = await handleSubscribe(client, data);
            break;
          case 'unsubscribe':
            response = await handleUnsubscribe(client, data);
            break;
          case 'get_metrics':
            response = await handleGetMetrics(client);
            break;
          case 'get_status':
            response = await handleGetStatus(client);
            break;
          case 'get_clients':
            response = await handleGetClients(client);
            break;
          case 'set_metadata':
            response = await handleSetMetadata(client, data);
            break;
          default:
            response = {
              type: 'echo',
              received: message,
              timestamp: new Date().toISOString()
            };
        }
        const processingTime = (performance.now() - msgStartTime).toFixed(2);
        response.processingTime = `${processingTime}ms`;
        ws.send(JSON.stringify(response));
      } catch (error) {
        logger.error('💥 Error processing WS message', {
          clientId: client.id,
          error: error.message,
          stack: error.stack
        });
        sendError(ws, 'Message processing failed', {
          error: error.message,
          type: 'PROCESSING_ERROR'
        });
      }
    });
    // 🚪 CLOSE HANDLER
    ws.on('close', (code, reason) => {
      const duration = client.getConnectionDuration();
      
      clientsStore.delete(client.id);
      updateMetrics('websocket', 'disconnected');
      logger.info('🔌 WebSocket client disconnected', {
        clientId: client.id,
        code,
        reason: reason.toString() || 'No reason provided',
        duration: formatDuration(duration),
        messageCount: client.messageCount,
        remainingClients: clientsStore.size
      });
      // 📝 Audit log
      if (global.auditLogger) {
        global.auditLogger.log('WS_DISCONNECTION', {
          clientId: client.id,
          duration,
          messageCount: client.messageCount,
          code,
          reason: reason.toString()
        });
      }
    });
    // 💥 ERROR HANDLER
    ws.on('error', (error) => {
      logger.error('💥 WebSocket error', {
        clientId: client.id,
        error: error.message,
        code: error.code
      });
    });
  } catch (error) {
    logger.error('💥 Fatal error in WebSocket connection setup', {
      error: error.message,
      stack: error.stack
    });
    ws.close(1011, 'Internal server error');
  }
});
// 🎯 MESSAGE HANDLERS
async function handleSubscribe(client, data) {
  const { channels = [] } = data;
  if (!Array.isArray(channels)) {
    throw new Error('Channels must be an array');
  }
  const validChannels = [
    'orders',
    'positions',
    'metrics',
    'health',
    'account',
    'market-data',
    'system'
  ];
  const invalidChannels = channels.filter(c => !validChannels.includes(c));
  
  if (invalidChannels.length > 0) {
    return {
      type: 'subscribe_error',
      error: 'Invalid channels',
      invalidChannels,
      validChannels
    };
  }
  if (client.subscriptions.size + channels.length > WS_CONFIG.limits.maxSubscriptions) {
    return {
      type: 'subscribe_error',
      error: 'Subscription limit exceeded',
      limit: WS_CONFIG.limits.maxSubscriptions,
      current: client.subscriptions.size
    };
  }
  channels.forEach(channel => client.subscriptions.add(channel));
  logger.info('✅ Client subscribed', {
    clientId: client.id,
    channels,
    totalSubscriptions: client.subscriptions.size
  });
  return {
    type: 'subscribed',
    channels: Array.from(client.subscriptions),
    timestamp: new Date().toISOString()
  };
}
async function handleUnsubscribe(client, data) {
  const { channels = [] } = data;
  if (channels.length === 0) {
    client.subscriptions.clear();
  } else {
    channels.forEach(channel => client.subscriptions.delete(channel));
  }
  return {
    type: 'unsubscribed',
    channels: Array.from(client.subscriptions),
    timestamp: new Date().toISOString()
  };
}
async function handleGetMetrics(client) {
  return {
    type: 'metrics',
    data: {
      ...global.metrics,
      websocket: {
        connected: clientsStore.size,
        totalConnections: updateMetrics('websocket', 'totalConnections', 0),
        messagesProcessed: Array.from(clientsStore.values())
          .reduce((sum, c) => sum + c.messageCount, 0)
      }
    },
    timestamp: new Date().toISOString()
  };
}
async function handleGetStatus(client) {
  return {
    type: 'status',
    data: {
      client: client.toJSON(),
      server: {
        uptime: process.uptime(),
        uptimeFormatted: formatUptime(process.uptime()),
        memory: {
          used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
          total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`
        },
        connectedClients: clientsStore.size
      }
    },
    timestamp: new Date().toISOString()
  };
}
async function handleGetClients(client) {
  // Solo usuarios autorizados pueden ver otros clientes
  if (!client.metadata.isAdmin) {
    return {
      type: 'error',
      error: 'Unauthorized',
      message: 'Only admin users can view client list'
    };
  }
  const clients = Array.from(clientsStore.values()).map(c => c.toJSON());
  return {
    type: 'clients',
    data: {
      total: clients.length,
      clients
    },
    timestamp: new Date().toISOString()
  };
}
async function handleSetMetadata(client, data) {
  client.metadata = { ...client.metadata, ...data };
  
  return {
    type: 'metadata_updated',
    metadata: client.metadata,
    timestamp: new Date().toISOString()
  };
}
// 🛡️ ERROR SENDER
function sendError(ws, message, details = {}) {
  try {
    ws.send(JSON.stringify({
      type: 'error',
      error: message,
      details,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    logger.error('Failed to send error message', { error: error.message });
  }
}
// ❤️ HEARTBEAT LEGENDARIO
const heartbeat = setInterval(() => {
  const now = Date.now();
  let terminated = 0;
  let active = 0;
  clientsStore.forEach((client, clientId) => {
    const ws = client.ws;
    // Check si el cliente está muerto
    if (!client.isAlive || client.missedPings >= WS_CONFIG.heartbeat.maxMissed) {
      logger.warn('💀 Terminating dead connection', {
        clientId,
        missedPings: client.missedPings,
        lastActivity: new Date(client.lastActivity).toISOString()
      });
      
      clientsStore.delete(clientId);
      ws.terminate();
      terminated++;
      return;
    }
    // Check timeout por inactividad
    if (now - client.lastActivity > WS_CONFIG.heartbeat.timeout) {
      client.missedPings++;
      logger.debug('⏰ Client inactive', {
        clientId,
        missedPings: client.missedPings,
        inactiveDuration: formatDuration(now - client.lastActivity)
      });
    }
    client.isAlive = false;
    ws.ping();
    active++;
  });
  if (terminated > 0 || active > 0) {
    logger.debug('❤️ Heartbeat completed', {
      active,
      terminated,
      total: clientsStore.size
    });
  }
}, WS_CONFIG.heartbeat.interval);
wss.on('close', () => {
  clearInterval(heartbeat);
  logger.info('🛑 WebSocket server closed, heartbeat stopped');
});
// 📡 BROADCAST ULTRA PRO
function broadcast(message, options = {}) {
  const {
    filter = null,
    channel = null,
    excludeClientId = null
  } = options;
  const data = JSON.stringify(message);
  let sent = 0;
  let failed = 0;
  const startTime = performance.now();
  clientsStore.forEach((client) => {
    const ws = client.ws;
    // Skip si el WS no está abierto
    if (ws.readyState !== 1) { // WebSocket.OPEN
      return;
    }
    // Skip si es el cliente excluido
    if (excludeClientId && client.id === excludeClientId) {
      return;
    }
    // Check filtro de canal
    if (channel && !client.subscriptions.has(channel)) {
      return;
    }
    // Check filtro custom
    if (filter && !filter(client)) {
      return;
    }
    try {
      ws.send(data);
      sent++;
    } catch (error) {
      failed++;
      logger.error('Failed to send broadcast to client', {
        clientId: client.id,
        error: error.message
      });
    }
  });
  const broadcastTime = (performance.now() - startTime).toFixed(2);
  if (sent > 0) {
    logger.info('📡 Broadcast sent', {
      type: message.type,
      recipients: sent,
      failed,
      channel: channel || 'all',
      latency: `${broadcastTime}ms`,
      payloadSize: `${(data.length / 1024).toFixed(2)}KB`
    });
  }
  return { sent, failed, latency: broadcastTime };
}
// 🔧 HELPERS PARA BROADCAST
function getActiveWebSocketClients() {
  return clientsStore.size;
}
function getTotalWebSocketClients() {
  return global.metrics?.websocket?.totalConnections || 0;
}
function getBroadcastQueueSize() {
  // Implementar si tienes cola de mensajes
  return 0;
}
// Exportar para uso global
global.broadcast = broadcast;
global.getActiveWebSocketClients = getActiveWebSocketClients;
global.getTotalWebSocketClients = getTotalWebSocketClients;
global.getBroadcastQueueSize = getBroadcastQueueSize;
// ===========================================================
// ⏰ CRON JOBS ULTRA PRO MAX
// ===========================================================
// 📊 Job cada minuto - Monitoreo de métricas
nodeCron.schedule('* * * * *', () => {
  try {
    const metricsData = {
      timestamp: new Date().toISOString(),
      activeConnections: clientsStore.size,
      metrics: {
        api: global.metrics?.api || {},
        orders: global.metrics?.orders || {},
        positions: global.metrics?.positions || {},
        websocket: {
          connected: clientsStore.size,
          totalMessages: Array.from(clientsStore.values())
            .reduce((sum, c) => sum + c.messageCount, 0)
        }
      },
      system: {
        memory: {
          used: process.memoryUsage().heapUsed / 1024 / 1024,
          usagePercent: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100).toFixed(2)
        },
        uptime: process.uptime()
      }
    };
    logger.debug('⏰ Cron: Metrics update', {
      clients: clientsStore.size,
      apiCalls: metricsData.metrics.api.calls || 0
    });
    // Broadcast a clientes suscritos
    broadcast({
      type: 'metrics_update',
      event: 'SCHEDULED_METRICS',
      data: metricsData
    }, { channel: 'metrics' });
  } catch (error) {
    logger.error('💥 Error in metrics cron job', {
      error: error.message
    });
  }
});
// 🏥 Job cada 5 minutos - Health check automático
nodeCron.schedule('*/5 * * * *', async () => {
  try {
    logger.info('⏰ Cron: Running automated health check');
    const healthData = {
      timestamp: new Date().toISOString(),
      services: {},
      overall: 'HEALTHY'
    };
    // Check Capital.com API
    try {
      const capitalHealth = await Promise.race([
        capitalService.healthCheck?.() || capitalService.testConnection?.() || 
        Promise.resolve({ success: true }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);
      healthData.services.capitalApi = {
        status: capitalHealth.success ? 'CONNECTED' : 'DEGRADED',
        timestamp: new Date().toISOString()
      };
      if (!capitalHealth.success) {
        healthData.overall = 'DEGRADED';
        logger.warn('⚠️ Capital.com API health check failed');
      }
    } catch (error) {
      healthData.services.capitalApi = {
        status: 'DISCONNECTED',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      healthData.overall = 'CRITICAL';
    }
    // Check Redis (si existe)
    if (global.redisClient) {
      try {
        await global.redisClient.ping();
        healthData.services.redis = {
          status: 'CONNECTED',
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        healthData.services.redis = {
          status: 'DISCONNECTED',
          error: error.message,
          timestamp: new Date().toISOString()
        };
        if (healthData.overall === 'HEALTHY') {
          healthData.overall = 'DEGRADED';
        }
      }
    }
    logger.info('✅ Health check completed', {
      overall: healthData.overall,
      services: Object.keys(healthData.services).length
    });
    // Broadcast a clientes suscritos
    broadcast({
      type: 'health_update',
      event: 'SCHEDULED_HEALTH_CHECK',
      data: healthData
    }, { channel: 'health' });
    // Alertar si hay problemas críticos
    if (healthData.overall === 'CRITICAL' && global.alertService) {
      global.alertService.critical('Health check failed', healthData);
    }
  } catch (error) {
    logger.error('💥 Error in health check cron job', {
      error: error.message,
      stack: error.stack
    });
  }
});
// 🧹 Job cada hora - Limpieza de métricas antiguas
nodeCron.schedule('0 * * * *', () => {
  try {
    logger.info('⏰ Cron: Running metrics cleanup');
    // Limpiar timestamps viejos de rate limiting
    clientsStore.forEach((client) => {
      const oneHourAgo = Date.now() - 3600000;
      client.messageTimestamps = client.messageTimestamps.filter(t => t > oneHourAgo);
    });
    logger.info('✅ Metrics cleanup completed');
  } catch (error) {
    logger.error('💥 Error in cleanup cron job', {
      error: error.message
    });
  }
});
// 📈 Job diario - Reporte de estadísticas
nodeCron.schedule('0 0 * * *', () => {
  try {
    logger.info('⏰ Cron: Generating daily report');
    const report = {
      date: new Date().toISOString().split('T')[0],
      metrics: {
        api: global.metrics?.api || {},
        orders: global.metrics?.orders || {},
        websocket: {
          peakConnections: global.metrics?.websocket?.peakConnections || 0,
          totalConnections: global.metrics?.websocket?.totalConnections || 0
        }
      },
      uptime: formatUptime(process.uptime())
    };
    logger.success('📊 Daily Report', report);
    // Guardar en archivo o DB si está configurado
    if (global.reportStorage) {
      global.reportStorage.save('daily', report);
    }
  } catch (error) {
    logger.error('💥 Error generating daily report', {
      error: error.message
    });
  }
});
// ===========================================================
// 🚫 MANEJO DE ERRORES GLOBAL LEGENDARIO
// ===========================================================
// 404 Handler Ultra Pro
app.use((req, res) => {
  const requestId = `404-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  
  logger.warn('🚫 Route not found', {
    requestId,
    method: req.method,
    path: req.url,
    ip: req.ip
  });
  res.status(404).json({
    success: false,
    status: 'NOT_FOUND',
    requestId,
    error: 'Endpoint no encontrado',
    path: req.url,
    method: req.method,
    suggestion: 'Verifica la documentación de la API',
    availableEndpoints: {
      core: [
        'GET /',
        'GET /health',
        'GET /metrics'
      ],
      trading: [
        'POST /api/orders',
        'GET /api/positions',
        'POST /api/positions/close'
      ],
      account: [
        'GET /api/account'
      ],
      websocket: [
        'WS /ws'
      ]
    },
    documentation: '/api/docs', // Si tienes docs
    timestamp: new Date().toISOString()
  });
});
// Error Handler Global Ultra Pro
app.use((err, req, res, next) => {
  const requestId = `ERR-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const isProduction = NODE_ENV === 'production';
  // Logging detallado
  logger.error('💥 Unhandled error', {
    requestId,
    error: err.message,
    stack: err.stack,
    path: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  // Determinar status code
  const statusCode = err.statusCode || err.status || 500;
  // Respuesta
  res.status(statusCode).json({
    success: false,
    status: 'ERROR',
    requestId,
    error: isProduction ? 'Error interno del servidor' : err.message,
    errorType: err.constructor.name,
    ...(!isProduction && {
      stack: err.stack,
      details: err.details || null
    }),
    timestamp: new Date().toISOString()
  });
  // Alertar si es error crítico
  if (statusCode === 500 && global.alertService) {
    global.alertService.error('Unhandled server error', {
      requestId,
      error: err.message,
      path: req.url
    });
  }
});
// ===========================================================
// 🛠️ UTILIDADES LEGENDARIAS
// ===========================================================
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  return parts.join(' ');
}
// ===========================================================
// 🔄 GRACEFUL SHUTDOWN LEGENDARIO
// ===========================================================
let isShuttingDown = false;
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    logger.warn('⚠️ Shutdown already in progress...');
    return;
  }
  isShuttingDown = true;
  
  logger.warn(`\n${'='.repeat(60)}`);
  logger.warn(`⚠️  GRACEFUL SHUTDOWN INITIATED - Signal: ${signal}`);
  logger.warn('='.repeat(60));
  const shutdownStart = Date.now();
  const shutdownSteps = [];
  try {
    // PASO 1: Detener aceptación de nuevas conexiones
    shutdownSteps.push('Closing HTTP server');
    server.close(() => {
      logger.info('✅ HTTP server closed');
    });
    // PASO 2: Notificar a clientes WebSocket
    shutdownSteps.push('Notifying WebSocket clients');
    const notifyResult = broadcast({
      type: 'server_shutdown',
      event: 'SERVER_MAINTENANCE',
      data: {
        message: 'Servidor cerrándose por mantenimiento',
        reconnect: true,
        estimatedDowntime: '30 seconds',
        timestamp: new Date().toISOString()
      }
    });
    logger.info(`✅ Notified ${notifyResult.sent} clients`);
    // PASO 3: Esperar procesamiento de mensajes pendientes
    shutdownSteps.push('Waiting for pending messages');
    await new Promise(resolve => setTimeout(resolve, 2000));
    // PASO 4: Cerrar WebSocket connections
    shutdownSteps.push('Closing WebSocket connections');
    let closedConnections = 0;
    clientsStore.forEach((client) => {
      try {
        client.ws.close(1001, 'Server restart');
        closedConnections++;
      } catch (error) {
        logger.error(`Failed to close client ${client.id}`, { error: error.message });
      }
    });
    logger.info(`✅ Closed ${closedConnections} WebSocket connections`);
    // PASO 5: Cerrar WebSocket server
    shutdownSteps.push('Closing WebSocket server');
    wss.close(() => {
      logger.info('✅ WebSocket server closed');
    });
    // PASO 6: Detener cron jobs
    shutdownSteps.push('Stopping cron jobs');
    nodeCron.getTasks().forEach(task => task.stop());
    logger.info('✅ All cron jobs stopped');
    // PASO 7: Cerrar conexiones externas
    if (global.redisClient) {
      shutdownSteps.push('Closing Redis connection');
      try {
        await global.redisClient.quit();
        logger.info('✅ Redis connection closed');
      } catch (error) {
        logger.error('⚠️ Redis cleanup failed', { error: error.message });
      }
    }
    if (global.database) {
      shutdownSteps.push('Closing database connection');
      try {
        await global.database.close();
        logger.info('✅ Database connection closed');
      } catch (error) {
        logger.error('⚠️ Database cleanup failed', { error: error.message });
      }
    }
    // PASO 8: Flush logs
    shutdownSteps.push('Flushing logs');
    if (logger.flush) {
      await logger.flush();
    }
     const shutdownDuration = Date.now() - shutdownStart;
    logger.warn('\n' + '='.repeat(60));
    logger.success('🎯 GRACEFUL SHUTDOWN COMPLETED');
    logger.info(`⏱️  Total shutdown time: ${shutdownDuration}ms`);
    logger.info(`📋 Steps completed: ${shutdownSteps.length}`);
    logger.warn('='.repeat(60) + '\n');
    // Audit final shutdown
    if (global.auditLogger) {
      try {
        await global.auditLogger.log('SERVER_SHUTDOWN', {
          signal,
          duration: shutdownDuration,
          stepsCompleted: shutdownSteps,
          closedConnections,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Failed to log shutdown audit', { error: error.message });
      }
    }
    // Esperar flush final de logs
    await new Promise(resolve => setTimeout(resolve, 500));
    process.exit(0);
  } catch (error) {
    logger.error('💥 Error during graceful shutdown', {
      error: error.message,
      stack: error.stack,
      completedSteps: shutdownSteps
    });
    // Forzar salida después de 5 segundos si hay error
    setTimeout(() => {
      logger.error('🚨 Forcing process exit after error');
      process.exit(1);
    }, 5000);
  }
}
// 🎯 SIGNAL HANDLERS
process.on('SIGINT', () => {
  logger.warn('\n🛑 SIGINT received (Ctrl+C)');
  gracefulShutdown('SIGINT');
});
process.on('SIGTERM', () => {
  logger.warn('\n🛑 SIGTERM received');
  gracefulShutdown('SIGTERM');
});
process.on('SIGHUP', () => {
  logger.warn('\n🔄 SIGHUP received (reload)');
  gracefulShutdown('SIGHUP');
});
// 💥 UNCAUGHT EXCEPTION HANDLER
process.on('uncaughtException', (error, origin) => {
  logger.error('💥💥 UNCAUGHT EXCEPTION', {
    error: error.message,
    stack: error.stack,
    origin,
    timestamp: new Date().toISOString()
  });
  // Intentar guardar el error antes de cerrar
  if (global.auditLogger) {
    try {
      global.auditLogger.logSync('UNCAUGHT_EXCEPTION', {
        error: error.message,
        stack: error.stack,
        origin
      });
    } catch (auditError) {
      console.error('Failed to log uncaught exception:', auditError);
    }
  }
  // Alertar si está configurado
  if (global.alertService) {
    try {
      global.alertService.criticalSync('Uncaught Exception', {
        error: error.message,
        origin
      });
    } catch (alertError) {
      console.error('Failed to send alert:', alertError);
    }
  }
  gracefulShutdown('uncaughtException');
});
// 🚫 UNHANDLED REJECTION HANDLER
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 UNHANDLED PROMISE REJECTION', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString(),
    timestamp: new Date().toISOString()
  });
  // Log pero no cerrar el proceso (puede ser no crítico)
  if (global.auditLogger) {
    global.auditLogger.log('UNHANDLED_REJECTION', {
      reason: reason?.message || reason,
      timestamp: new Date().toISOString()
    }).catch(err => {
      console.error('Failed to log unhandled rejection:', err);
    });
  }
});
// ⚠️ WARNING HANDLER (Node.js warnings)
process.on('warning', (warning) => {
  logger.warn('⚠️ Node.js Warning', {
    name: warning.name,
    message: warning.message,
    stack: warning.stack
  });
});
// 📊 MEMORY MONITORING
let lastMemoryCheck = Date.now();
const MEMORY_CHECK_INTERVAL = 60000; // 1 minuto
setInterval(() => {
  const memUsage = process.memoryUsage();
  const heapPercent = (memUsage.heapUsed / memUsage.heapTotal * 100).toFixed(2);
  
  // Alertar si el uso de memoria es alto
  if (heapPercent > 85) {
    logger.warn('⚠️ HIGH MEMORY USAGE', {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      usagePercent: `${heapPercent}%`,
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`
    });
    // Alertar si está configurado
    if (global.alertService && heapPercent > 90) {
      global.alertService.warning('High memory usage detected', {
        usagePercent: heapPercent,
        timestamp: new Date().toISOString()
      });
    }
    // Sugerir garbage collection manual si está disponible
    if (global.gc) {
      logger.info('🧹 Triggering manual garbage collection');
      global.gc();
    }
  }
  lastMemoryCheck = Date.now();
}, MEMORY_CHECK_INTERVAL);
// ===========================================================
// 🚀 INICIO DEL SERVIDOR LEGENDARIO
// ===========================================================
async function startServer() {
  const startTime = performance.now();
  try {
    // 🎨 BANNER ÉPICO
    console.log('\n');
    console.log('╔' + '═'.repeat(58) + '╗');
    console.log('║' + ' '.repeat(58) + '║');
    console.log('║' + '  🚀 TRADING BOT LEGENDARIO ULTRA PRO MAX 2.0  '.padEnd(58) + '║');
    console.log('║' + ' '.repeat(58) + '║');
    console.log('╚' + '═'.repeat(58) + '╝');
    console.log('\n');
    // 🔍 PRE-FLIGHT CHECKS
    logger.info('🔍 Running pre-flight checks...');
    // Check 1: Environment variables
    const requiredEnvVars = ['CAPITAL_API_KEY', 'CAPITAL_PASSWORD', 'CAPITAL_IDENTIFIER'];
    const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missingEnvVars.length > 0) {
      logger.error('❌ Missing required environment variables:', missingEnvVars);
      process.exit(1);
    }
    logger.success('✅ Environment variables validated');
    // Check 2: Capital.com API connection
    logger.info('🔌 Testing Capital.com API connection...');
    try {
      const healthCheck = await Promise.race([
        capitalService.healthCheck?.() || capitalService.testConnection?.() || 
        Promise.resolve({ success: true }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        )
      ]);
      if (healthCheck.success) {
        logger.success('✅ Capital.com API: OPERATIONAL');
      } else {
        logger.warn('⚠️ Capital.com API: DEGRADED');
      }
    } catch (error) {
      logger.error('❌ Capital.com API connection failed:', error.message);
      logger.warn('⚠️ Starting in degraded mode...');
    }
    // Check 3: Redis (si está configurado)
    if (process.env.REDIS_URL) {
      logger.info('🔌 Testing Redis connection...');
      try {
        const Redis = require('ioredis');
        global.redisClient = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => Math.min(times * 50, 2000)
        });
        await global.redisClient.ping();
        logger.success('✅ Redis: CONNECTED');
        // Configurar Redis Pub/Sub si está disponible
        global.redisPublisher = global.redisClient.duplicate();
        logger.success('✅ Redis Pub/Sub: READY');
      } catch (error) {
        logger.warn('⚠️ Redis connection failed, continuing without caching');
        global.redisClient = null;
      }
    }
    // Check 4: Database (si está configurado)
    if (process.env.DATABASE_URL) {
      logger.info('🔌 Testing database connection...');
      try {
        // Implementar según tu DB (PostgreSQL, MongoDB, etc.)
        // global.database = await connectDatabase(process.env.DATABASE_URL);
        // logger.success('✅ Database: CONNECTED');
      } catch (error) {
        logger.warn('⚠️ Database connection failed, continuing without persistence');
      }
    }
    // Check 5: Alert service (si está configurado)
    if (process.env.SLACK_WEBHOOK || process.env.PAGERDUTY_KEY) {
      logger.info('📢 Initializing alert service...');
      try {
        const AlertService = require('./services/alertService'); // Implementar
        global.alertService = new AlertService({
          slack: process.env.SLACK_WEBHOOK,
          pagerduty: process.env.PAGERDUTY_KEY
        });
        logger.success('✅ Alert service: READY');
      } catch (error) {
        logger.warn('⚠️ Alert service initialization failed');
      }
    }
    // 🚀 INICIAR SERVIDOR HTTP
    await new Promise((resolve, reject) => {
      server.listen(PORT, '0.0.0.0', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    const startupTime = (performance.now() - startTime).toFixed(2);
    // 🎉 SERVIDOR INICIADO
    console.log('╔' + '═'.repeat(58) + '╗');
    console.log('║' + ' '.repeat(58) + '║');
    logger.success(`║  ✅ SERVER ONLINE - Ready in ${startupTime}ms`.padEnd(59) + '║');
    console.log('║' + ' '.repeat(58) + '║');
    console.log('╠' + '═'.repeat(58) + '╣');
    console.log('║' + ' '.repeat(58) + '║');
    logger.info(`║  🌐 HTTP Server:    http://localhost:${PORT}`.padEnd(59) + '║');
    logger.info(`║  🔌 WebSocket:      ws://localhost:${PORT}/ws`.padEnd(59) + '║');
    logger.info(`║  📊 Metrics:        http://localhost:${PORT}/metrics`.padEnd(59) + '║');
    logger.info(`║  🏥 Health:         http://localhost:${PORT}/health`.padEnd(59) + '║');
    logger.info(`║  📚 Account:        http://localhost:${PORT}/api/account`.padEnd(59) + '║');
    console.log('║' + ' '.repeat(58) + '║');
    console.log('╠' + '═'.repeat(58) + '╣');
    console.log('║' + ' '.repeat(58) + '║');
    logger.info(`║  🌍 Environment:    ${NODE_ENV.toUpperCase()}`.padEnd(59) + '║');
    logger.info(`║  📦 Node Version:   ${process.version}`.padEnd(59) + '║');
    logger.info(`║  💾 Memory:         ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`.padEnd(59) + '║');
    logger.info(`║  🔌 WS Clients:     0 / ${WS_CONFIG.limits.maxConnections}`.padEnd(59) + '║');
    console.log('║' + ' '.repeat(58) + '║');
    console.log('╠' + '═'.repeat(58) + '╣');
    console.log('║' + ' '.repeat(58) + '║');
    
    // Mostrar servicios opcionales disponibles
    const optionalServices = [];
    if (global.redisClient) optionalServices.push('Redis');
    if (global.database) optionalServices.push('Database');
    if (global.alertService) optionalServices.push('Alerts');
    
    if (optionalServices.length > 0) {
      logger.info(`║  ✨ Optional:       ${optionalServices.join(', ')}`.padEnd(59) + '║');
      console.log('║' + ' '.repeat(58) + '║');
      console.log('╠' + '═'.repeat(58) + '╣');
      console.log('║' + ' '.repeat(58) + '║');
    }
    logger.success('║  🎯 System Status:  OPERATIONAL'.padEnd(59) + '║');
    logger.success('║  💎 Ready to trade! Let\'s make some profit! 🚀'.padEnd(59) + '║');
    console.log('║' + ' '.repeat(58) + '║');
    console.log('╚' + '═'.repeat(58) + '╝');
    console.log('\n');
    // 📝 AUDIT LOG DE INICIO
    if (global.auditLogger) {
      await global.auditLogger.log('SERVER_START', {
        startupTime: `${startupTime}ms`,
        environment: NODE_ENV,
        nodeVersion: process.version,
        port: PORT,
        timestamp: new Date().toISOString(),
        services: {
          capitalApi: true,
          redis: !!global.redisClient,
          database: !!global.database,
          alerts: !!global.alertService
        }
      });
    }
    // 🔔 ALERTAR INICIO (si está configurado)
    if (global.alertService) {
      global.alertService.info('Trading Bot Started', {
        environment: NODE_ENV,
        startupTime: `${startupTime}ms`,
        timestamp: new Date().toISOString()
      }).catch(err => {
        logger.debug('Failed to send startup alert', { error: err.message });
      });
    }
    // 📊 PEAK CONNECTIONS TRACKER
    setInterval(() => {
      const currentConnections = clientsStore.size;
      if (!global.metrics.websocket.peakConnections || 
          currentConnections > global.metrics.websocket.peakConnections) {
        global.metrics.websocket.peakConnections = currentConnections;
      }
    }, 5000);
  } catch (error) {
    logger.error('💥💥 FATAL: Server startup failed', {
      error: error.message,
      stack: error.stack
    });
    console.log('\n');
    console.log('╔' + '═'.repeat(58) + '╗');
    console.log('║' + ' '.repeat(58) + '║');
    logger.error('║  ❌ SERVER STARTUP FAILED'.padEnd(59) + '║');
    console.log('║' + ' '.repeat(58) + '║');
    console.log('╚' + '═'.repeat(58) + '╝');
    console.log('\n');
    process.exit(1);
  }
}
// 🚀 EJECUTAR INICIO DEL SERVIDOR
startServer().catch((error) => {
  console.error('💥 Failed to start server:', error);
  process.exit(1);
});
// ===========================================================
// 📊 STATISTICS TRACKER (BONUS)
// ===========================================================
// Track estadísticas en tiempo real
setInterval(() => {
  const stats = {
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    clients: {
      connected: clientsStore.size,
      subscriptions: Array.from(clientsStore.values())
        .reduce((sum, c) => sum + c.subscriptions.size, 0),
      totalMessages: Array.from(clientsStore.values())
        .reduce((sum, c) => sum + c.messageCount, 0)
    },
    metrics: global.metrics
  };
  // Guardar en histórico (si está configurado)
  if (global.statsStorage) {
    global.statsStorage.push(stats);
    
    // Mantener solo últimas 24 horas
    const oneDayAgo = Date.now() - 86400000;
    global.statsStorage = global.statsStorage.filter(s => s.timestamp > oneDayAgo);
  } else {
    global.statsStorage = [stats];
  }
}, 30000); // Cada 30 segundos
// ===========================================================
// 🎯 ENDPOINT ADICIONAL: ESTADÍSTICAS EN VIVO
// ===========================================================
app.get('/api/stats/live', (req, res) => {
  const clients = Array.from(clientsStore.values());
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      server: {
        uptime: process.uptime(),
        uptimeFormatted: formatUptime(process.uptime()),
        memory: {
          used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
          total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
          usagePercent: `${((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100).toFixed(2)}%`
        },
        cpu: process.cpuUsage()
      },
      websocket: {
        clients: {
          connected: clients.length,
          peak: global.metrics?.websocket?.peakConnections || 0,
          total: global.metrics?.websocket?.totalConnections || 0
        },
        subscriptions: {
          total: clients.reduce((sum, c) => sum + c.subscriptions.size, 0),
          byChannel: clients.reduce((acc, c) => {
            c.subscriptions.forEach(sub => {
              acc[sub] = (acc[sub] || 0) + 1;
            });
            return acc;
          }, {})
        },
        messages: {
          total: clients.reduce((sum, c) => sum + c.messageCount, 0),
          perClient: clients.length > 0 ? 
            (clients.reduce((sum, c) => sum + c.messageCount, 0) / clients.length).toFixed(2) : 0
        }
      },
      api: global.metrics?.api || {},
      orders: global.metrics?.orders || {},
      positions: global.metrics?.positions || {},
      account: global.metrics?.account || {}
    }
  });
});
// ===========================================================
// 🎯 ENDPOINT ADICIONAL: CLIENTES CONECTADOS (ADMIN)
// ===========================================================
app.get('/api/ws/clients', (req, res) => {
  // Validar token de admin (implementar según tu auth)
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }
  const clients = Array.from(clientsStore.values()).map(c => c.toJSON());
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      total: clients.length,
      clients: clients.sort((a, b) => b.messageCount - a.messageCount)
    }
  });
});
// ===========================================================
// 🎯 ENDPOINT ADICIONAL: FORZAR DISCONNECT DE CLIENTE (ADMIN)
// ===========================================================
app.post('/api/ws/disconnect/:clientId', (req, res) => {
  // Validar token de admin
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }
  const { clientId } = req.params;
  const { reason = 'Admin disconnect' } = req.body;
  const client = clientsStore.get(clientId);
  
  if (!client) {
    return res.status(404).json({
      success: false,
      error: 'Client not found',
      clientId
    });
  }
  client.ws.close(1008, reason);
  clientsStore.delete(clientId);
  logger.warn('🔨 Admin forced disconnect', {
    clientId,
    reason,
    admin: req.ip
  });
  res.json({
    success: true,
    message: 'Client disconnected',
    clientId,
    reason
  });
});
// ===========================================================
// 💎 EXPORTACIONES PARA TESTING
// ===========================================================
module.exports = {
  app,
  server,
  wss,
  broadcast,
  getActiveWebSocketClients,
  gracefulShutdown
};

