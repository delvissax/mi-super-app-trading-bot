// index.js dentro de carpeta service - modo PRO ultra MAX

// Importar servicios individuales desde archivos separados
const userService = require("./userService");
const productService = require("./productService");
const orderService = require("./orderService");

// Logger simple (podría ser reemplazado por winston o pino)
const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
};

// Wrapper para ejecutar funciones con manejo centralizado de errores
const execute = async (serviceFunc, ...args) => {
  try {
    logger.info(`Ejecutando ${serviceFunc.name}`);
    const result = await serviceFunc(...args);
    logger.info(`${serviceFunc.name} ejecutado correctamente`);
    return result;
  } catch (error) {
    logger.error(`Error en ${serviceFunc.name}: ${error.message}`);
    throw error;
  }
};

// Exportar interfaz clara de servicios con manejo de errores y logs
module.exports = {
  userService: {
    getUser: (...args) => execute(userService.getUser, ...args),
    createUser: (...args) => execute(userService.createUser, ...args),
    // otras funciones de userService...
  },
  productService: {
    getProduct: (...args) => execute(productService.getProduct, ...args),
    createProduct: (...args) => execute(productService.createProduct, ...args),
    // otras funciones de productService...
  },
  orderService: {
    placeOrder: (...args) => execute(orderService.placeOrder, ...args),
    cancelOrder: (...args) => execute(orderService.cancelOrder, ...args),
    // otras funciones de orderService...
  },
};
