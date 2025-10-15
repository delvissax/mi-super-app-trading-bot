// index.js - TRADING BOT ULTRA PRO MAX LEVEL DIOS 🔥🚀
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import nodeCron from 'node-cron';
import { WebSocketServer } from 'ws';
import capitalService from './services/capitalService.js';

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

app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production',
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

// Métricas del sistema
app.get('/metrics', (req, res) => {
  const uptime = Math.floor((Date.now() - metrics.uptime.start) / 1000);
  
  res.json({
    success: true,
    metrics: {
      ...metrics,
      uptime: {
        seconds: uptime,
        formatted: formatUptime(uptime),
      },
      websocket: {
        ...metrics.websocket,
        activeConnections: wss.clients.size,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// ===========================================================
// 📈 ENDPOINTS DE TRADING ULTRA PRO
// ===========================================================

// Crear orden
app.post('/api/orders', async (req, res) => {
  try {
    const { type, symbol, amount, mode = 'demo', options = {} } = req.body;
    
    // Validación de entrada
    if (!type || !symbol || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Parámetros requeridos: type, symbol, amount',
        received: { type, symbol, amount },
      });
    }
    
    logger.trade(`Nueva orden: ${type} ${amount} ${symbol} (${mode})`);
    updateMetrics('orders', 'total');
    
    const result = await capitalService.placeOrder(
      type,
      symbol,
      amount,
      mode,
      options
    );
    
    if (result.success) {
      updateMetrics('orders', 'success');
      logger.success(`Orden ejecutada: ${result.requestId}`);
      
      // Broadcast a WebSocket clients
      broadcast({
        type: 'order_placed',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } else {
      updateMetrics('orders', 'failed');
      logger.error(`Orden fallida: ${result.error}`);
    }
    
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    updateMetrics('orders', 'failed');
    logger.error('Error procesando orden:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Obtener posiciones abiertas
app.get('/api/positions', async (req, res) => {
  try {
    const mode = req.query.mode || 'demo';
    
    logger.info(`Consultando posiciones (${mode})`);
    
    const result = await capitalService.getPositions(mode);
    
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Error obteniendo posiciones:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Cerrar posición específica
app.delete('/api/positions/:dealId', async (req, res) => {
  try {
    const { dealId } = req.params;
    const mode = req.query.mode || 'demo';
    
    if (!dealId) {
      return res.status(400).json({
        success: false,
        error: 'dealId es requerido',
      });
    }
    
    logger.trade(`Cerrando posición: ${dealId} (${mode})`);
    
    const result = await capitalService.closePosition(dealId, mode);
    
    if (result.success) {
      logger.success(`Posición cerrada: ${dealId}`);
      
      // Broadcast a WebSocket clients
      broadcast({
        type: 'position_closed',
        data: result,
        timestamp: new Date().toISOString(),
      });
    }
    
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Error cerrando posición:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Información de cuenta
app.get('/api/account', async (req, res) => {
  try {
    const mode = req.query.mode || 'demo';
    
    logger.info(`Consultando info de cuenta (${mode})`);
    
    const result = await capitalService.getAccountInfo(mode);
    
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Error obteniendo info de cuenta:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Test de conexión con la API
app.get('/api/test-connection', async (req, res) => {
  try {
    const mode = req.query.mode || 'demo';
    
    logger.info(`Testeando conexión (${mode})`);
    
    const result = await capitalService.testConnection(mode);
    
    res.status(result.success ? 200 : 503).json(result);
  } catch (error) {
    logger.error('Error en test de conexión:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ===========================================================
// 🔌 WEBSOCKET ULTRA PRO CON HEARTBEAT
// ===========================================================

// Configuración de heartbeat para mantener conexiones vivas
const HEARTBEAT_INTERVAL = 30000; // 30 segundos

wss.on('connection', (ws, req) => {
  const clientId = generateClientId();
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() 
    || req.socket.remoteAddress;
  
  ws.id = clientId;
  ws.isAlive = true;
  ws.connectedAt = Date.now();
  
  metrics.websocket.connected++;
  metrics.websocket.totalConnections++;
  
  logger.ws(`Cliente conectado: ${clientId} desde ${ip}`);
  
  // Mensaje de bienvenida
  ws.send(JSON.stringify({
    type: 'welcome',
    clientId,
    message: '🚀 Conectado al Trading Bot Ultra Pro Max',
    timestamp: new Date().toISOString(),
  }));
  
  // Heartbeat - pong response
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  // Manejo de mensajes entrantes
  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      logger.ws(`Mensaje de ${clientId}: ${data.type || 'unknown'}`);
      
      // Responder según el tipo de mensaje
      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
          
        case 'subscribe':
          ws.subscriptions = data.channels || [];
          ws.send(JSON.stringify({
            type: 'subscribed',
            channels: ws.subscriptions,
            timestamp: new Date().toISOString(),
          }));
          break;
          
        case 'get_metrics':
          ws.send(JSON.stringify({
            type: 'metrics',
            data: metrics,
            timestamp: new Date().toISOString(),
          }));
          break;
          
        default:
          ws.send(JSON.stringify({
            type: 'echo',
            received: data,
            timestamp: new Date().toISOString(),
          }));
      }
    } catch (error) {
      logger.error(`Error procesando mensaje WS de ${clientId}:`, error.message);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Formato de mensaje inválido',
        timestamp: new Date().toISOString(),
      }));
    }
  });
  
  // Manejo de cierre de conexión
  ws.on('close', (code, reason) => {
    metrics.websocket.connected--;
    const duration = Math.floor((Date.now() - ws.connectedAt) / 1000);
    logger.ws(`Cliente desconectado: ${clientId} (duración: ${duration}s, código: ${code})`);
  });
  
  // Manejo de errores
  ws.on('error', (error) => {
    logger.error(`Error WS en ${clientId}:`, error.message);
  });
});

// Heartbeat para detectar conexiones muertas
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      logger.warn(`Terminando conexión inactiva: ${ws.id}`);
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  });
}, HEARTBEAT_INTERVAL);

wss.on('close', () => {
  clearInterval(heartbeat);
});

// Función para broadcast a todos los clientes
function broadcast(message, filter = null) {
  const data = JSON.stringify(message);
  let sent = 0;
  
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      if (!filter || filter(client)) {
        client.send(data);
        sent++;
      }
    }
  });
  
  if (sent > 0) {
    logger.ws(`Broadcast enviado a ${sent} cliente(s): ${message.type}`);
  }
}

// ===========================================================
// ⏰ CRON JOBS ULTRA PRO
// ===========================================================

// Job cada minuto - Monitoreo de métricas
nodeCron.schedule('* * * * *', () => {
  logger.info('Ejecutando tarea programada - Monitoreo');
  
  // Broadcast de métricas a clientes suscritos
  broadcast({
    type: 'metrics_update',
    data: {
      timestamp: new Date().toISOString(),
      activeConnections: wss.clients.size,
      metrics: {
        requests: metrics.requests,
        orders: metrics.orders,
      },
    },
  }, (client) => client.subscriptions?.includes('metrics'));
});

// Job cada 5 minutos - Health check automático
nodeCron.schedule('*/5 * * * *', async () => {
  try {
    logger.info('Ejecutando health check automático...');
    const health = await capitalService.healthCheck();
    
    if (!health.success) {
      logger.warn('Health check falló, servicios degradados');
    }
    
    // Notificar a clientes suscritos
    broadcast({
      type: 'health_update',
      data: health,
      timestamp: new Date().toISOString(),
    }, (client) => client.subscriptions?.includes('health'));
  } catch (error) {
    logger.error('Error en health check automático:', error.message);
  }
});

// ===========================================================
// 🚫 MANEJO DE ERRORES GLOBAL
// ===========================================================

// 404 Handler
app.use((req, res) => {
  logger.warn(`Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.url,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /metrics',
      'POST /api/orders',
      'GET /api/positions',
      'DELETE /api/positions/:dealId',
      'GET /api/account',
      'GET /api/test-connection',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Error Handler Global
app.use((err, req, res, next) => {
  logger.error('Error no capturado:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
    ...(NODE_ENV !== 'production' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// ===========================================================
// 🛠️ UTILIDADES
// ===========================================================

function generateClientId() {
  return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}

// ===========================================================
// 🔄 GRACEFUL SHUTDOWN ULTRA PRO
// ===========================================================

async function gracefulShutdown(signal) {
  logger.warn(`\n⚠️  Señal ${signal} recibida. Iniciando shutdown graceful...`);
  
  // Detener aceptación de nuevas conexiones
  server.close(() => {
    logger.info('✅ Servidor HTTP cerrado');
  });
  
  // Cerrar WebSocket con mensaje de despedida
  broadcast({
    type: 'server_shutdown',
    message: 'Servidor cerrándose. Reconecta en unos momentos.',
    timestamp: new Date().toISOString(),
  });
  
  wss.clients.forEach((client) => {
    client.close(1001, 'Server shutdown');
  });
  
  wss.close(() => {
    logger.info('✅ WebSocket server cerrado');
  });
  
  // Esperar procesos pendientes (máx 10s)
  setTimeout(() => {
    logger.success('🎯 Shutdown completado exitosamente');
    process.exit(0);
  }, 10000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('💥 Excepción no capturada:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Promesa rechazada no manejada:', reason);
});

// ===========================================================
// 🚀 INICIO DEL SERVIDOR ULTRA PRO
// ===========================================================

server.listen(PORT, '0.0.0.0', async () => {
  console.log('\n' + '='.repeat(60));
  logger.success(`🚀 TRADING BOT ULTRA PRO MAX - INICIADO`);
  console.log('='.repeat(60));
  logger.info(`🌐 Servidor HTTP: http://localhost:${PORT}`);
  logger.info(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
  logger.info(`📊 Métricas: http://localhost:${PORT}/metrics`);
  logger.info(`🏥 Health: http://localhost:${PORT}/health`);
  logger.info(`🌍 Entorno: ${NODE_ENV}`);
  console.log('='.repeat(60) + '\n');
  
  // Health check inicial
  try {
    const health = await capitalService.healthCheck();
    if (health.success) {
      logger.success('✅ Servicios externos: OPERACIONALES');
    } else {
      logger.warn('⚠️  Algunos servicios externos no están disponibles');
    }
  } catch (error) {
    logger.error('❌ Error verificando servicios externos:', error.message);
  }
  
  logger.info('✨ Sistema listo para operar. ¡A tradear se ha dicho!\n');
});
