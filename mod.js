// mod.js - ULTRA MÓDULO LETAL CON IA 🔥🧠 - VERSIÓN CORREGIDA
// Sistema avanzado con análisis semántico, auto-corrección y validación inteligente
// ===========================================================
// 🧩 DEPENDENCIAS DEL SISTEMA - mod.js
// ===========================================================

import fs from 'fs';
import path from 'path';

// ===========================================================
// 🧠 FIN DE IMPORTACIONES DEL SISTEMA
// ===========================================================

// ===========================================================
// 🎯 CONSTANTES Y CONFIGURACIÓN PRINCIPAL
// ===========================================================
export const PI = 3.14159265359;
export const VERSION = '2.0.0';
export const MODULE_NAME = 'UltraModuleLetal';

export const multiplicar = (a, b) => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('❌ multiplicar: Ambos parámetros deben ser números');
  }

  if (!isFinite(a) || !isFinite(b)) {
    throw new Error('❌ multiplicar: Los números deben ser finitos');
  }

  const resultado = a * b;

  // Verificar overflow
  if (!isFinite(resultado)) {
    throw new Error('❌ multiplicar: Overflow en multiplicación');
  }

  return resultado;
};

const saludo = () => {
  return '🚀 Trading Bot Ultra Pro Max - ¡Sistemas operativos!';
};

// ===========================================================
// 🎨 SISTEMA DE LOGGING AVANZADO MEJORADO
// ===========================================================
class SmartLogger {
  constructor() {
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[36m',
      magenta: '\x1b[35m',
      dim: '\x1b[2m',
    };
    this.history = [];
    this.maxHistory = 1000;
    this.enabled = true;
  }

  log(level, message, data = null) {
    if (!this.enabled) {
      return;
    }

    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, data };

    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    const color = this.getColorForLevel(level);
    const icon = this.getIconForLevel(level);

    console.log(`${color}${icon} [${level.toUpperCase()}]${this.colors.reset} ${message}`);
    if (data && process.env.NODE_ENV !== 'production') {
      console.log(`${this.colors.dim}   Data:`, data, this.colors.reset);
    }
  }

  getColorForLevel(level) {
    const map = {
      info: this.colors.blue,
      success: this.colors.green,
      warn: this.colors.yellow,
      error: this.colors.red,
      debug: this.colors.magenta,
      trade: this.colors.magenta,
    };
    return map[level] || this.colors.reset;
  }

  getIconForLevel(level) {
    const map = {
      info: 'ℹ️',
      success: '✅',
      warn: '⚠️',
      error: '❌',
      debug: '🔍',
      trade: '📈',
    };
    return map[level] || '📝';
  }

  info(msg, data) {
    this.log('info', msg, data);
  }

  success(msg, data) {
    this.log('success', msg, data);
  }

  warn(msg, data) {
    this.log('warn', msg, data);
  }

  error(msg, data) {
    this.log('error', msg, data);
  }

  debug(msg, data) {
    this.log('debug', msg, data);
  }

  trade(msg, data) {
    this.log('trade', msg, data);
  }

  getHistory() {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

// ===========================================================
// 🧠 ANALIZADOR SEMÁNTICO DE FUNCIONES MEJORADO
// ===========================================================
class FunctionIntentAnalyzer {
  constructor() {
    this.intentPatterns = {
      calculation: /(?:calculate|compute|sum|multiply|divide|add|subtract)/i,
      data_fetch: /(?:get|fetch|retrieve|load|read|query)/i,
      data_store: /(?:set|save|store|write|update|insert)/i,
      validation: /(?:validate|verify|check|is|has|ensure)/i,
      transformation: /(?:transform|convert|map|filter|parse|format)/i,
      authentication: /(?:auth|login|logout|token|verify|session)/i,
      error_handling: /(?:handle|catch|error|fail|retry)/i,
      utility: /(?:helper|util|format|parse|normalize)/i,
      async_operation: /(?:async|await|promise|fetch|request)/i,
      event_handling: /(?:on|handle|listen|emit|dispatch|trigger)/i,
      trading: /(?:trade|order|position|buy|sell|market)/i,
    };

    this.complexityWeights = {
      if: 1,
      for: 2,
      while: 2,
      switch: 3,
      try: 1,
      catch: 1,
      async: 2,
      await: 1,
      promise: 2,
      callback: 3,
      recursion: 5,
    };
  }

  analyzeIntent(funcName, funcCode) {
    try {
      const intentions = [];
      const confidence = {};

      // 1. Analizar por nombre
      for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
        if (pattern.test(funcName)) {
          intentions.push(intent);
          confidence[intent] = 0.8;
        }
      }

      // 2. Analizar por contenido
      for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
        if (pattern.test(funcCode) && !intentions.includes(intent)) {
          intentions.push(intent);
          confidence[intent] = 0.6;
        }
      }

      // 3. Calcular complejidad
      const complexity = this.calculateComplexity(funcCode);

      // 4. Detectar características especiales
      const features = {
        isAsync: /async/.test(funcCode),
        hasErrorHandling: /try\s*{/.test(funcCode),
        hasDependencies: this.detectDependencies(funcCode),
        hasLoops: /(?:for|while|forEach)/.test(funcCode),
        hasConditionals: /\bif\b/.test(funcCode),
        returnsPromise: /return\s+(?:new\s+)?Promise/.test(funcCode),
        hasSideEffects: this.detectSideEffects(funcCode),
        hasRecursion: new RegExp(`\\b${funcName}\\s*\\(`).test(funcCode),
      };

      return {
        name: funcName,
        primaryIntent: intentions[0] || 'unknown',
        allIntents: intentions,
        confidence,
        complexity,
        features,
        recommendation: this.generateRecommendation(intentions, complexity, features),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: funcName,
        primaryIntent: 'analysis_error',
        allIntents: [],
        confidence: {},
        complexity: { score: 0, level: 'unknown', maxNesting: 0 },
        features: {},
        recommendation: ['Error en análisis: ' + error.message],
        error: error.message,
      };
    }
  }

  calculateComplexity(code) {
    try {
      let score = 1;

      for (const [keyword, weight] of Object.entries(this.complexityWeights)) {
        const pattern = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = code.match(pattern) || [];
        score += matches.length * weight;
      }

      const maxNesting = this.calculateMaxNesting(code);
      score += maxNesting * 2;

      let level, recommendation;
      if (score <= 5) {
        level = 'low';
        recommendation = 'Complejidad aceptable';
      } else if (score <= 15) {
        level = 'medium';
        recommendation = 'Considerar refactorización si crece';
      } else if (score <= 30) {
        level = 'high';
        recommendation = 'Recomendado refactorizar en funciones más pequeñas';
      } else {
        level = 'critical';
        recommendation = '⚠️ Refactorización urgente requerida';
      }

      return {
        score,
        level,
        maxNesting,
        recommendation,
        analysis: {
          conditionals: (code.match(/\bif\b/gi) || []).length,
          loops: (code.match(/(?:for|while|forEach)/gi) || []).length,
          tryBlocks: (code.match(/try\s*{/gi) || []).length,
        },
      };
    } catch (error) {
      return {
        score: 0,
        level: 'error',
        maxNesting: 0,
        recommendation: 'Error calculando complejidad',
        error: error.message,
      };
    }
  }

  calculateMaxNesting(code) {
    try {
      let current = 0;
      let max = 0;

      for (const char of code) {
        if (char === '{') {
          current++;
          if (current > max) {
            max = current;
          }
        } else if (char === '}') {
          current--;
        }
      }

      return max;
    } catch {
      return 0;
    }
  }

  detectDependencies(code) {
    const deps = {
      external: [],
      global: [],
      internal: [],
    };

    try {
      // Detectar imports ES6
      const importPattern = /import\s+.*from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importPattern.exec(code)) !== null) {
        deps.external.push(match[1]);
      }

      // Detectar requires
      const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      while ((match = requirePattern.exec(code)) !== null) {
        deps.external.push(match[1]);
      }

      // Detectar uso de globals
      const globalPatterns = ['console', 'process', 'global', 'window', 'document', 'localStorage'];
      for (const global of globalPatterns) {
        if (new RegExp(`\\b${global}\\b`).test(code)) {
          deps.global.push(global);
        }
      }

      return deps;
    } catch (error) {
      return { external: [], global: [], internal: [], error: error.message };
    }
  }

  detectSideEffects(code) {
    const sideEffects = [];

    try {
      const patterns = {
        modifies_global: /global\.\w+\s*=/,
        console_output: /console\.(log|warn|error|info)/,
        file_system: /fs\.(read|write|append|delete)/,
        network: /(?:fetch|axios|http\.|https\.)/,
        database: /(?:db\.|query|insert|update|delete)/,
        dom_manipulation: /document\./,
        timer: /(?:setTimeout|setInterval)/,
      };

      for (const [effect, pattern] of Object.entries(patterns)) {
        if (pattern.test(code)) {
          sideEffects.push(effect);
        }
      }

      return sideEffects;
    } catch (error) {
      return [`error: ${error.message}`];
    }
  }

  generateRecommendation(intentions, complexity, features) {
    const recommendations = [];

    // Complejidad
    if (complexity.level === 'high') {
      recommendations.push(
        '🔴 Alta complejidad: considerar refactorizar en funciones más pequeñas',
      );
    } else if (complexity.level === 'critical') {
      recommendations.push('🚨 Complejidad crítica: refactorización urgente requerida');
    }

    // Async sin error handling
    if (features.isAsync && !features.hasErrorHandling) {
      recommendations.push('🟡 Función async sin try-catch: agregar manejo de errores');
    }

    // Side effects sin documentar
    if (features.hasSideEffects.length > 0 && !intentions.includes('utility')) {
      recommendations.push(`🟡 Tiene side effects: ${features.hasSideEffects.join(', ')}`);
    }

    // Promise sin await
    if (features.returnsPromise && !features.isAsync) {
      recommendations.push('💡 Retorna Promise pero no es async: considerar usar async/await');
    }

    // Recursión sin base case check
    if (features.hasRecursion && !features.codeIncludesConditional && !features.hasBaseCase) {
  recommendations.push('⚠️ Función recursiva: verificar caso base');
} 


    if (recommendations.length === 0) {
      recommendations.push('✅ Función bien estructurada y mantenible');
    }

    return recommendations;
  }
}

// ===========================================================
// 🔧 AUTO-CORRECTOR DE CÓDIGO MEJORADO
// ===========================================================
class CodeAutoFixer {
  constructor() {
    this.fixes = [];
    this.analyzer = new FunctionIntentAnalyzer();
    this.logger = new SmartLogger();
  }

  async autoFix(code, fileName = 'unknown') {
    this.logger.info(`🔧 Iniciando auto-corrección para: ${fileName}`);

    let fixedCode = code;
    const appliedFixes = [];
    const warnings = [];

    try {
      // 1. Corregir WebSocket issues
      const wsFixed = this.fixWebSocketIssues(fixedCode);
      if (wsFixed.modified) {
        fixedCode = wsFixed.code;
        appliedFixes.push(...wsFixed.fixes);
      }

      // 2. Corregir Async/Await issues
      const asyncFixed = this.fixAsyncAwaitIssues(fixedCode);
      if (asyncFixed.modified) {
        fixedCode = asyncFixed.code;
        appliedFixes.push(...asyncFixed.fixes);
      }

      // 3. Modernizar variables
      const varFixed = this.modernizeVariables(fixedCode);
      if (varFixed.modified) {
        fixedCode = varFixed.code;
        appliedFixes.push(...varFixed.fixes);
      }

      // 4. Corregir Promise issues
      const promiseFixed = this.fixPromiseIssues(fixedCode);
      if (promiseFixed.modified) {
        fixedCode = promiseFixed.code;
        appliedFixes.push(...promiseFixed.fixes);
      }

      // 5. Optimizar estructuras
      const optimized = this.optimizeStructures(fixedCode);
      if (optimized.modified) {
        fixedCode = optimized.code;
        appliedFixes.push(...optimized.fixes);
      }

      // 6. Agregar validaciones
      const validationFixed = this.addValidations(fixedCode);
      if (validationFixed.modified) {
        fixedCode = validationFixed.code;
        appliedFixes.push(...validationFixed.fixes);
      }

      this.logger.success(`✅ Auto-corrección completada: ${appliedFixes.length} fixes aplicados`);

      return {
        original: code,
        fixed: fixedCode,
        appliedFixes,
        warnings,
        hasChanges: appliedFixes.length > 0,
        summary: {
          totalFixes: appliedFixes.length,
          file: fileName,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error en auto-corrección: ${error.message}`);
      return {
        original: code,
        fixed: code,
        appliedFixes: [],
        warnings: [`Error: ${error.message}`],
        hasChanges: false,
        error: error.message,
      };
    }
  }

  fixWebSocketIssues(code) {
    const fixedCode = code;
    const fixes = [];
    const modified = false;

    try {
      // Agregar verificación de readyState antes de send
      const sendPattern = /(\w+)\.send\s*\(/g;
      let match;

      while ((match = sendPattern.exec(code)) !== null) {
        const varName = match[1];
        const index = match.index;

        // Verificar si ya tiene check
        const contextBefore = code.substring(Math.max(0, index - 200), index);

        if (
          !contextBefore.includes(`${varName}.readyState`) &&
          !contextBefore.includes('readyState === 1')
        ) {
          const lineNumber = code.substring(0, index).split('\n').length;

          fixes.push({
            type: 'websocket_readystate_check',
            description: `Agregar verificación de readyState para ${varName}.send()`,
            line: lineNumber,
            severity: 'medium',
            automatic: false,
            suggestion: `if (${varName}.readyState === 1) { ${varName}.send(...) }`,
          });

          this.logger.warn(
            `⚠️ Línea ${lineNumber}: WebSocket.send() sin verificación de readyState`,
          );
        }
      }

      return { code: fixedCode, fixes, modified };
    } catch (error) {
      this.logger.error(`Error en fixWebSocketIssues: ${error.message}`);
      return { code: fixedCode, fixes, modified: false };
    }
  }

  fixAsyncAwaitIssues(code) {
    let fixedCode = code;
    const fixes = [];
    let modified = false;

    try {
      // Detectar await sin try-catch
      const awaitPattern = /(await\s+[\w.]+\s*\([^)]*\))/g;
      let match;

      while ((match = awaitPattern.exec(code)) !== null) {
        const awaitExpr = match[1];
        const index = match.index;
        const line = code.substring(0, index).split('\n').length;

        // Verificar si ya está en try-catch
        const contextBefore = code.substring(Math.max(0, index - 500), index);
        const hasTryCatch = /try\s*{[^}]*$/.test(contextBefore);

        if (!hasTryCatch) {
          fixes.push({
            type: 'async_try_catch_wrap',
            description: 'Await sin try-catch detectado',
            line,
            severity: 'medium',
            automatic: false,
            suggestion: `try { ${awaitExpr} } catch (error) { logger.error('Error:', error); }`,
          });

          this.logger.warn(`⚠️ Línea ${line}: await sin try-catch detectado`);
        }
      }

      // Eliminar async innecesario
      const asyncFuncPattern = /async\s+function\s+(\w+)\s*\([^)]*\)\s*{([^}]*)}/g;

      while ((match = asyncFuncPattern.exec(code)) !== null) {
        const funcName = match[1];
        const funcBody = match[2];

        if (!funcBody.includes('await') && !funcBody.includes('Promise')) {
          fixes.push({
            type: 'remove_unnecessary_async',
            description: `Función ${funcName} marcada como async innecesariamente`,
            line: code.substring(0, match.index).split('\n').length,
            severity: 'low',
            automatic: true,
          });

          fixedCode = fixedCode.replace(
            new RegExp(`async\\s+function\\s+${funcName}`),
            `function ${funcName}`,
          );

          modified = true;
        }
      }

      return { code: fixedCode, fixes, modified };
    } catch (error) {
      this.logger.error(`Error en fixAsyncAwaitIssues: ${error.message}`);
      return { code: fixedCode, fixes, modified: false };
    }
  }

  modernizeVariables(code) {
    let fixedCode = code;
    const fixes = [];
    let modified = false;

    try {
      // Reemplazar var con const/let
      const varPattern = /\bvar\s+(\w+)/g;
      let match;

      while ((match = varPattern.exec(code)) !== null) {
        const varName = match[1];
        const line = code.substring(0, match.index).split('\n').length;

        const reassignPattern = new RegExp(`${varName}\\s*=`, 'g');
        const assignments = (code.match(reassignPattern) || []).length;

        const replacement = assignments > 1 ? 'let' : 'const';

        fixedCode = fixedCode.replace(
          new RegExp(`\\bvar\\s+${varName}\\b`),
          `${replacement} ${varName}`,
        );

        fixes.push({
          type: 'modernize_variable_declaration',
          description: `Reemplazado 'var ${varName}' con '${replacement}'`,
          line,
          severity: 'low',
          automatic: true,
        });

        modified = true;
      }

      return { code: fixedCode, fixes, modified };
    } catch (error) {
      this.logger.error(`Error en modernizeVariables: ${error.message}`);
      return { code: fixedCode, fixes, modified: false };
    }
  }

  fixPromiseIssues(code) {
    const fixes = [];

    try {
      // Detectar Promises sin .catch()
      const promisePattern = /new\s+Promise\s*\([^)]+\)/g;
      let match;

      while ((match = promisePattern.exec(code)) !== null) {
        const index = match.index;
        const line = code.substring(0, index).split('\n').length;

        // Buscar si tiene .catch después
        const contextAfter = code.substring(index, Math.min(code.length, index + 300));

        if (!contextAfter.includes('.catch(')) {
          fixes.push({
            type: 'promise_add_catch',
            description: 'Promise sin .catch() detectado',
            line,
            severity: 'medium',
            automatic: false,
            suggestion: ".catch(error => { logger.error('Promise error:', error); })",
          });

          this.logger.warn(`⚠️ Línea ${line}: Promise sin manejo de errores`);
        }
      }

      return { code, fixes, modified: false };
    } catch (error) {
      this.logger.error(`Error en fixPromiseIssues: ${error.message}`);
      return { code, fixes, modified: false };
    }
  }

  optimizeStructures(code) {
    const fixes = [];

    try {
      // Sugerir refactorización de callback hell
      const callbackHellPattern = /\}\s*\)\s*\.\s*then\s*\(\s*function/g;

      if (callbackHellPattern.test(code)) {
        fixes.push({
          type: 'suggest_async_refactor',
          description: 'Callback hell detectado - considerar refactorizar a async/await',
          severity: 'low',
          automatic: false,
          suggestion: 'Convertir cadena de .then() a async/await para mejor legibilidad',
        });
      }

      return { code, fixes, modified: false };
    } catch (error) {
      this.logger.error(`Error en optimizeStructures: ${error.message}`);
      return { code, fixes, modified: false };
    }
  }

  addValidations(code) {
    const fixes = [];

    try {
      // Detectar funciones sin validación de parámetros
      const funcPattern = /function\s+(\w+)\s*\(([^)]*)\)\s*{/g;
      let match;

      while ((match = funcPattern.exec(code)) !== null) {
        const funcName = match[1];
        const params = match[2]
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p);
        const line = code.substring(0, match.index).split('\n').length;

        // Verificar si tiene validaciones básicas
        const funcBody = code.substring(match.index, Math.min(code.length, match.index + 500));

        const hasValidation = /if\s*\(.*===\s*undefined|if\s*\(!.*\)|typeof.*===/.test(funcBody);

        if (!hasValidation && params.length > 0) {
          fixes.push({
            type: 'add_parameter_validation',
            description: `Función ${funcName} sin validación de parámetros`,
            line,
            severity: 'low',
            automatic: false,
            suggestion: `Agregar: if (!${params[0]}) throw new Error('Parámetro requerido');`,
          });
        }
      }

      return { code, fixes, modified: false };
    } catch (error) {
      this.logger.error(`Error en addValidations: ${error.message}`);
      return { code, fixes, modified: false };
    }
  }
}

// ===========================================================
// 📦 VALIDADOR DE DEPENDENCIAS MEJORADO
// ===========================================================
class DependencyManager {
  constructor() {
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.nodeModulesPath = path.join(process.cwd(), 'node_modules');
    this.logger = new SmartLogger();
  }

  async validateAndFix(code) {
    this.logger.info('📦 Validando dependencias...');

    try {
      const imports = this.extractImports(code);
      const issues = [];
      const fixes = [];

      // Verificar package.json
      const packageJson = await this.loadPackageJson();

      if (!packageJson) {
        issues.push({
          type: 'missing_package_json',
          severity: 'critical',
          description: 'package.json no encontrado',
          fix: await this.createPackageJson(),
        });
      }

      // Verificar cada import
      for (const imp of imports) {
        if (imp.type === 'external') {
          const check = await this.checkExternalDependency(imp, packageJson);
          if (!check.valid) {
            issues.push(check);

            // Auto-fix: agregar a package.json
            if (packageJson && check.fix) {
              const fixed = await this.addDependency(imp.module, packageJson);
              if (fixed) {
                fixes.push({
                  type: 'dependency_added',
                  module: imp.module,
                  description: `Agregado ${imp.module} a package.json`,
                  automatic: true,
                });
              }
            }
          }
        } else if (imp.type === 'local') {
          const check = await this.checkLocalFile(imp);
          if (!check.valid) {
            issues.push(check);
          }
        }
      }

      this.logger.success(
        `✅ Validación completada: ${imports.length} imports, ${issues.length} issues`,
      );

      return {
        imports,
        issues,
        fixes,
        summary: {
          total: imports.length,
          external: imports.filter((i) => i.type === 'external').length,
          local: imports.filter((i) => i.type === 'local').length,
          issues: issues.length,
          fixesApplied: fixes.length,
        },
        healthy: issues.length === 0,
      };
    } catch (error) {
      this.logger.error(`❌ Error en validación de dependencias: ${error.message}`);
      return {
        imports: [],
        issues: [{ type: 'validation_error', severity: 'critical', description: error.message }],
        fixes: [],
        summary: { total: 0, external: 0, local: 0, issues: 1, fixesApplied: 0 },
        healthy: false,
        error: error.message,
      };
    }
  }

  extractImports(code) {
    const imports = [];

    try {
      // ES6 imports
      const es6Pattern = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
      let match;

      while ((match = es6Pattern.exec(code)) !== null) {
        const named = match[1];
        const defaultImport = match[2];
        const modulePath = match[3];

        imports.push({
          type: modulePath.startsWith('.') ? 'local' : 'external',
          module: modulePath.split('/')[0],
          path: modulePath,
          imports: named ? named.split(',').map((s) => s.trim()) : [defaultImport],
          line: code.substring(0, match.index).split('\n').length,
          raw: match[0],
        });
      }

      // require()
      const requirePattern =
        /(?:const|let|var)\s+(?:{([^}]+)}|(\w+))\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

      while ((match = requirePattern.exec(code)) !== null) {
        const named = match[1];
        const defaultImport = match[2];
        const modulePath = match[3];

        imports.push({
          type: modulePath.startsWith('.') ? 'local' : 'external',
          module: modulePath.split('/')[0],
          path: modulePath,
          imports: named ? named.split(',').map((s) => s.trim()) : [defaultImport],
          line: code.substring(0, match.index).split('\n').length,
          raw: match[0],
        });
      }

      return imports;
    } catch (error) {
      this.logger.error(`Error extrayendo imports: ${error.message}`);
      return [];
    }
  }

  async loadPackageJson() {
    try {
      if (!fs.existsSync(this.packageJsonPath)) {
        return null;
      }

      const content = fs.readFileSync(this.packageJsonPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Error leyendo package.json:', error.message);
      return null;
    }
  }

  async checkExternalDependency(imp, packageJson) {
    const moduleName = imp.module;

    try {
      // Check si es módulo nativo de Node
      const builtins = [
        'fs',
        'path',
        'http',
        'https',
        'crypto',
        'os',
        'util',
        'stream',
        'events',
        'url',
      ];
      if (builtins.includes(moduleName)) {
        return { valid: true, builtin: true };
      }

      if (!packageJson) {
        return {
          valid: false,
          type: 'missing_in_package_json',
          severity: 'high',
          module: moduleName,
          description: `Módulo '${moduleName}' no está en package.json`,
          fix: `npm install ${moduleName}`,
        };
      }

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (!allDeps[moduleName]) {
        return {
          valid: false,
          type: 'missing_dependency',
          severity: 'critical',
          module: moduleName,
          line: imp.line,
          description: `Módulo '${moduleName}' importado pero no instalado`,
          fix: `npm install ${moduleName}`,
        };
      }

      // Verificar si está instalado físicamente
      const modulePath = path.join(this.nodeModulesPath, moduleName);
      if (!fs.existsSync(modulePath)) {
        return {
          valid: false,
          type: 'not_installed',
          severity: 'high',
          module: moduleName,
          description: `Módulo '${moduleName}' en package.json pero no instalado`,
          fix: 'npm install',
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        type: 'check_error',
        severity: 'high',
        module: moduleName,
        description: `Error verificando dependencia: ${error.message}`,
      };
    }
  }

  async checkLocalFile(imp) {
    try {
      const filePath = path.resolve(process.cwd(), imp.path);

      // Probar con diferentes extensiones
      const extensions = ['', '.js', '.mjs', '.json', '/index.js'];

      for (const ext of extensions) {
        if (fs.existsSync(filePath + ext)) {
          return { valid: true, resolvedPath: filePath + ext };
        }
      }

      return {
        valid: false,
        type: 'missing_local_file',
        severity: 'critical',
        path: imp.path,
        line: imp.line,
        description: `Archivo local '${imp.path}' no encontrado`,
        fix: 'Crear archivo o corregir path',
      };
    } catch (error) {
      return {
        valid: false,
        type: 'check_error',
        severity: 'high',
        path: imp.path,
        description: `Error verificando archivo local: ${error.message}`,
      };
    }
  }

  async addDependency(moduleName, packageJson) {
    try {
      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }

      // Usar versión estable en lugar de 'latest'
      packageJson.dependencies[moduleName] = '^1.0.0';

      fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

      this.logger.success(`✅ Agregado ${moduleName} a package.json`);
      return true;
    } catch (error) {
      this.logger.error(`Error agregando dependencia: ${error.message}`);
      return false;
    }
  }

  async createPackageJson() {
    const template = {
      name: 'trading-bot-ultra-pro',
      version: '1.0.0',
      description: 'Trading Bot Ultra Pro Max - Auto-generated by Ultra Module Letal',
      main: 'index.js',
      type: 'module',
      scripts: {
        start: 'node index.js',
        dev: 'node --watch index.js',
        test: 'echo "No tests specified" && exit 0',
        build: 'echo "No build step" && exit 0',
      },
      keywords: ['trading', 'bot', 'crypto', 'forex'],
      author: 'Trading Bot Team',
      license: 'MIT',
      dependencies: {},
      devDependencies: {},
      engines: {
        node: '>=18.0.0',
      },
    };

    try {
      fs.writeFileSync(this.packageJsonPath, JSON.stringify(template, null, 2), 'utf8');
      this.logger.success('✅ package.json creado automáticamente');
      return true;
    } catch (error) {
      this.logger.error(`Error creando package.json: ${error.message}`);
      return false;
    }
  }
}

// ===========================================================
// 🚀 FUNCIONES PRINCIPALES DE EXPORTACIÓN
// ===========================================================

/**
 * Ejecuta análisis inteligente completo del módulo
 * @param {string} filePath - Ruta del archivo a analizar
 * @returns {Promise<Object>} Resultado del análisis completo
 */
export async function runSmartCheck(filePath) {
  const logger = new SmartLogger();

  logger.info(`🚀 Iniciando análisis inteligente del módulo: ${filePath}`);

  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const analyzer = new FunctionIntentAnalyzer();
    const fixer = new CodeAutoFixer();
    const deps = new DependencyManager();

    const analysis = analyzer.analyzeIntent(path.basename(filePath), code);
    const autoFix = await fixer.autoFix(code, filePath);
    const depReport = await deps.validateAndFix(code);

    const summary = {
      file: filePath,
      intent: analysis.primaryIntent,
      complexity: analysis.complexity.level,
      sideEffects: analysis.features.hasSideEffects,
      fixesApplied: autoFix.appliedFixes.length,
      depIssues: depReport.issues.length,
      healthy: depReport.healthy && analysis.complexity.level !== 'critical',
      timestamp: new Date().toISOString(),
    };

    logger.success('🧩 Análisis completado:', summary);

    return {
      analysis,
      autoFix,
      depReport,
      summary,
      recommendations: [
        ...analysis.recommendation,
        ...autoFix.appliedFixes.map((f) => f.description),
        ...depReport.issues.map((i) => i.description),
      ],
    };
  } catch (error) {
    logger.error(`❌ Error en runSmartCheck: ${error.message}`);
    return {
      error: error.message,
      healthy: false,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Obtiene el estado de salud del sistema
 * @returns {Object} Estado del sistema
 */
export function getSystemHealth() {
  return {
    status: 'healthy',
    module: MODULE_NAME,
    version: VERSION,
    timestamp: new Date().toISOString(),
    features: {
      analyzer: true,
      autoFixer: true,
      dependencyManager: true,
      logger: true,
    },
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  };
}

// ===========================================================
// 📦 EXPORTACIONES PRINCIPALES
// ===========================================================

export { SmartLogger, FunctionIntentAnalyzer, CodeAutoFixer, DependencyManager };

export default saludo;
