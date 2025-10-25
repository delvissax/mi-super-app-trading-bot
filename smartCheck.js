import fs from 'fs/promises';
import path from 'path';

import { SmartLogger, FunctionIntentAnalyzer, CodeAutoFixer, DependencyManager } from './mod.js';

const logger = new SmartLogger();

// Función auxiliar para reintentos con retraso exponencial
async function retryAsync(fn, attempts = 3, delay = 500) {
  try {
    return await fn();
  } catch (err) {
    if (attempts <= 1) {
      throw err;
    }
    await new Promise((res) => setTimeout(res, delay));
    return retryAsync(fn, attempts - 1, delay * 2);
  }
}

export async function runSmartCheck(filePath) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    logger.error('🚫 Parámetro inválido para filePath.');
    return { error: 'Invalid filePath parameter' };
  }

  logger.info(`🚀 Iniciando análisis inteligente del módulo: ${filePath}`);

  // Verificar existencia y permisos del archivo
  try {
    await fs.access(filePath, fs.constants.R_OK);
  } catch {
    const msg = `❌ El archivo no existe o no es legible: ${filePath}`;
    logger.error(msg);
    return { error: msg };
  }

  let code = '';
  // Leer archivo con reintentos
  try {
    code = await retryAsync(() => fs.readFile(filePath, 'utf8'), 3, 1000);
  } catch (readError) {
    logger.error(`Error leyendo archivo: ${readError.message}`);
    return { error: `Error reading file: ${readError.message}` };
  }

  const analyzer = new FunctionIntentAnalyzer();
  const fixer = new CodeAutoFixer();
  const deps = new DependencyManager();

  let analysis, autoFix, depReport;

  // Análisis con reintentos
  try {
    analysis = await retryAsync(
      () => Promise.resolve(analyzer.analyzeIntent(path.basename(filePath), code)),
      3,
      1000,
    );
  } catch (err) {
    logger.error(`Error en análisis: ${err.message}`);
    return { error: `Analysis error: ${err.message}` };
  }

  // Auto corrección con reintentos
  try {
    autoFix = await retryAsync(() => fixer.autoFix(code), 3, 1000);
  } catch (err) {
    logger.error(`Error en auto-fix: ${err.message}`);
    return { error: `AutoFix error: ${err.message}` };
  }

  // Validación y corrección dependencias con reintentos
  try {
    depReport = await retryAsync(() => deps.validateAndFix(code), 3, 1000);
  } catch (err) {
    logger.error(`Error en dependencia: ${err.message}`);
    return { error: `DependencyManager error: ${err.message}` };
  }

  const summary = {
    file: filePath,
    intent: analysis?.primaryIntent || 'Desconocido',
    complexity: analysis?.complexity?.level || 'Desconocido',
    sideEffects: analysis?.features?.hasSideEffects || false,
    fixesApplied: autoFix?.appliedFixes?.length || 0,
    depIssues: depReport?.issues?.length || 0,
  };

  logger.success(`🧩 Análisis completo: ${JSON.stringify(summary, null, 2)}`);

  return { analysis, autoFix, depReport, summary };
}

// Ejecución rápida con argumento CLI
if (process.argv[2]) {
  runSmartCheck(process.argv[2])
    .then(() => logger.info('✅ Ejecución finalizada'))
    .catch((err) => logger.error(`Error inesperado: ${err.message}`));
}
