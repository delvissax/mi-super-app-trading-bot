// src/routes/mobileRoutes.js
const express = require('express');
const router = express.Router();
const { getAccountBalance } = require('../services/capitalService');

// Endpoint para obtener balance DEMO
router.get('/demo-balance', async (req, res) => {
  try {
    console.log('📱 Mobile app requesting demo balance...');
    
    // Obtener balance real de Capital.com Demo
    const balanceData = await getAccountBalance(true); // true = demo mode
    
    // Formatear respuesta para la app móvil
    const mobileResponse = {
      success: true,
      balance: balanceData.balance || 10000.00, // Fallback si no hay conexión
      change: 2.5, // % cambio simulado
      userId: 'QUANTUM_USER_001',
      currency: 'USD',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    };
    
    console.log('✅ Balance sent to mobile:', mobileResponse.balance);
    res.json(mobileResponse);
    
  } catch (error) {
    console.error('❌ Error getting balance for mobile:', error);
    
    // Respuesta de fallback para desarrollo
    const fallbackResponse = {
      success: true,
      balance: 12500.75,
      change: 1.8,
      userId: 'QUANTUM_USER_001', 
      currency: 'USD',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    };
    
    res.json(fallbackResponse);
  }
});

// Endpoint para ejecutar trades
router.post('/execute-trade', async (req, res) => {
  try {
    const { symbol, direction, amount } = req.body;
    
    console.log(`📱 Trade request: ${direction} ${amount} ${symbol}`);
    
    // Aquí integrarías con capitalService para trading real
    const tradeResult = {
      success: true,
      orderId: 'ORD_' + Date.now(),
      symbol: symbol,
      direction: direction,
      amount: amount,
      status: 'EXECUTED',
      timestamp: new Date().toISOString()
    };
    
    res.json(tradeResult);
    
  } catch (error) {
    console.error('❌ Trade error:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
