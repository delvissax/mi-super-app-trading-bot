// routes/accountRoutes.js

const express = require("express");
const router = express.Router();

// Importar controladores específicos de cuenta
const {
  getAccountDetails,
  updateAccountInfo,
  deleteAccount,
} = require("../controllers/accountController");

// Prefijo base: /api/account

// Ruta para obtener detalles de la cuenta
router.get("/details", getAccountDetails);

// Ruta para actualizar información de la cuenta
router.put("/update", updateAccountInfo);

// Ruta para eliminar la cuenta
router.delete("/delete", deleteAccount);

module.exports = router;
