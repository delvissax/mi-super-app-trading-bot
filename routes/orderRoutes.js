// routes/orderRoutes.js

const express = require("express");
const router = express.Router();

// Importar controladores para órdenes
const {
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  listOrders,
} = require("../controllers/orderController");

// Prefijo base: /api/order

// Crear nueva orden
router.post("/", createOrder);

// Obtener orden por ID
router.get("/:orderId", getOrderById);

// Actualizar orden existente
router.put("/:orderId", updateOrder);

// Eliminar orden
router.delete("/:orderId", deleteOrder);

// Listar todas las órdenes (con posible paginación y filtros)
router.get("/", listOrders);

module.exports = router;
