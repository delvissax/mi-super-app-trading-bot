// routes/healthRoutes.js

const express = require("express");
const router = express.Router();

// Importar controladores de health check
const { checkHealthStatus, getSystemMetrics } = require("../controllers/healthController");

// Prefijo base: /api/health

// Ruta para chequear estado básico del servicio
router.get("/status", checkHealthStatus);

// Ruta para obtener métricas del sistema (opcional)
router.get("/metrics", getSystemMetrics);

module.exports = router;
