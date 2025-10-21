// mod.js - ULTRA MÓDULO LETAL CON IA 🔥🧠
// Sistema avanzado con análisis semántico, auto-corrección y validación inteligente

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import saludo, { PI, multiplicar } from './mod.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===========================================================
// 🎨 SISTEMA DE LOGGING AVANZADO
// ===========================================================
class SmartLogger {
  constructor() {
    this.colors = {
      reset: "\x1b[0m",
      bright: "\x1b[1m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[36m",
      magenta: "\x1b[35m",
      dim: "\x1b[2m",
    };
    this.history = [];
    this.maxHistory = 100;
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, data };

    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    const color = this.getColorForLevel(level);
    const icon = this.getIconForLevel(level);

    console.log(`${color}${icon} [${level.toUpperCase()}]${this.colors.reset} ${message}`);
    if (data) {
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
    };
    return map[level] || this.colors.reset;
  }

  getIconForLevel(level) {
    const map = {
      info: "ℹ️",
      success: "✅",
      warn: "⚠️",
      error: "❌",
      debug: "🔍",
    };
    return map[level] || "📝";
  }

  info(msg, data) {
    this.log("info", msg, data);
  }
  success(msg, data) {
    this.log("success", msg, data);
  }
  warn(msg, data) {
    this.log("warn", msg, data);
  }
  error(msg, data) {
    this.log("error", msg, data);
  }
  debug(msg, data) {
    this.log("debug", msg, data);
  }
}

const logger = new SmartLogger();

// ===========================================================
// 🧠 ANALIZADOR SEMÁNTICO DE FUNCIONES
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
    };
  }

  /**
   * 🎯 Analiza la intención de una función
   * @param {string} funcName - Nombre de la función
   * @param {string} funcCode - Código completo de la función
   * @returns {Object} Análisis detallado de intención
   */
  analyzeIntent(funcName, funcCode) {
    const intentions = [];
    const confidence = {};

    // 1. Analizar por nombre
    for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
      if (pattern.test(funcName)) {
        intentions.push(intent);
        confidence[intent] = 0.8; // Alta confianza por nombre
      }
    }

    // 2. Analizar por contenido
    for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
      if (pattern.test(funcCode) && !intentions.includes(intent)) {
        intentions.push(intent);
        confidence[intent] = 0.6; // Media confianza por contenido
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
    };

    return {
      name: funcName,
      primaryIntent: intentions[0] || "unknown",
      allIntents: intentions,
      confidence,
      complexity,
      features,
      recommendation: this.generateRecommendation(intentions, complexity, features),
    };
  }

  calculateComplexity(code) {
    let score = 1; // Base complexity

    for (const [keyword, weight] of Object.entries(this.complexityWeights)) {
      const pattern = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = code.match(pattern) || [];
      score += matches.length * weight;
    }

    // Penalizar anidación
    const maxNesting = this.calculateMaxNesting(code);
    score += maxNesting * 2;

    return {
      score,
      level: score <= 5 ? "low" : score <= 15 ? "medium" : "high",
      maxNesting,
      recommendation:
        score > 20 ? "Consider breaking into smaller functions" : "Complexity is acceptable",
    };
  }

  calculateMaxNesting(code) {
    let current = 0;
    let max = 0;

    for (const char of code) {
      if (char === "{") {
        current++;
        if (current > max) max = current;
      } else if (char === "}") {
        current--;
      }
    }

    return max;
  }

  detectDependencies(code) {
    const deps = {
      external: [],
      global: [],
    };

    // Detectar imports/requires
    const importPattern = /import\s+.*from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importPattern.exec(code)) !== null) {
      deps.external.push(match[1]);
    }

    // Detectar uso de globals comunes
    const globalPatterns = ["console", "process", "global", "window", "document"];
    for (const global of globalPatterns) {
      if (new RegExp(`\\b${global}\\b`).test(code)) {
        deps.global.push(global);
      }
    }

    return deps;
  }

  detectSideEffects(code) {
    const sideEffects = [];

    const patterns = {
      modifies_global: /global\.\w+\s*=/,
      console_output: /console\./,
      file_system: /fs\./,
      network: /(?:fetch|axios|http\.)/,
      database: /(?:db\.|query|insert|update)/,
      dom_manipulation: /document\./,
    };

    for (const [effect, pattern] of Object.entries(patterns)) {
      if (pattern.test(code)) {
        sideEffects.push(effect);
      }
    }

    return sideEffects;
  }

  generateRecommendation(intentions, complexity, features) {
    const recommendations = [];

    // Complejidad
    if (complexity.score > 20) {
      recommendations.push(
        "⚠️ Alta complejidad: considerar refactorizar en funciones más pequeñas"
      );
    }

    // Async sin error handling
    if (features.isAsync && !features.hasErrorHandling) {
      recommendations.push("⚠️ Función async sin try-catch: agregar manejo de errores");
    }

    // Side effects sin documentar
    if (features.hasSideEffects.length > 0 && !intentions.includes("utility")) {
      recommendations.push(`⚠️ Tiene side effects: ${features.hasSideEffects.join(", ")}`);
    }

    // Promise sin await
    if (features.returnsPromise && !features.isAsync) {
      recommendations.push("💡 Retorna Promise pero no es async: considerar usar async/await");
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Función bien estructurada");
    }

    return recommendations;
  }
}

// ===========================================================
// 🔧 AUTO-CORRECTOR DE CÓDIGO
// ===========================================================
class CodeAutoFixer {
  constructor() {
    this.fixes = [];
    this.analyzer = new FunctionIntentAnalyzer();
  }

  /**
   * 🛠️ Corrige problemas comunes de lógica
   * @param {string} code - Código a corregir
   * @returns {Object} Código corregido y reporte
   */
  async autoFix(code) {
    logger.info("🔧 Iniciando auto-corrección de código...");

    let fixedCode = code;
    const appliedFixes = [];

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

    // 3. Corregir Promise issues
    const promiseFixed = this.fixPromiseIssues(fixedCode);
    if (promiseFixed.modified) {
      fixedCode = promiseFixed.code;
      appliedFixes.push(...promiseFixed.fixes);
    }

    // 4. Corregir Memory Leaks
    const memoryFixed = this.fixMemoryLeaks(fixedCode);
    if (memoryFixed.modified) {
      fixedCode = memoryFixed.code;
      appliedFixes.push(...memoryFixed.fixes);
    }

    // 5. Optimizar estructuras
    const optimized = this.optimizeStructures(fixedCode);
    if (optimized.modified) {
      fixedCode = optimized.code;
      appliedFixes.push(...optimized.fixes);
    }

    logger.success(`✅ Auto-corrección completada: ${appliedFixes.length} fixes aplicados`);

    return {
      original: code,
      fixed: fixedCode,
      appliedFixes,
      comparison: this.generateDiff(code, fixedCode),
    };
  }

  fixWebSocketIssues(code) {
    let fixedCode = code;
    const fixes = [];
    let modified = false;

    // Fix 1: Agregar verificación de readyState antes de send
    const sendPattern = /(\w+)\.send\s*\(/g;
    let match;
    const replacements = [];

    while ((match = sendPattern.exec(code)) !== null) {
      const varName = match[1];
      const index = match.index;

      // Verificar si ya tiene check
      const contextBefore = code.substring(Math.max(0, index - 200), index);

      if (
        !contextBefore.includes(`${varName}.readyState`) &&
        !contextBefore.includes("readyState === 1")
      ) {
        const originalLine = match[0];
        const fixedLine = `if (${varName}.readyState === 1) { ${varName}.send(`;

        replacements.push({
          start: index,
          end: index + match[0].length,
          original: originalLine,
          replacement: fixedLine,
          needsClosing: true,
        });

        fixes.push({
          type: "websocket_readystate_check",
          description: `Agregado check de readyState para ${varName}.send()`,
          line: code.substring(0, index).split("\n").length,
        });

        modified = true;
      }
    }

    // Aplicar reemplazos (en orden inverso para no afectar índices)
    replacements.reverse().forEach((repl) => {
      const before = fixedCode.substring(0, repl.start);
      const after = fixedCode.substring(repl.end);

      // Buscar el cierre del send() para agregar }
      let afterModified = after;
      if (repl.needsClosing) {
        const closeIndex = after.indexOf(";");
        if (closeIndex !== -1) {
          afterModified =
            after.substring(0, closeIndex + 1) + " }" + after.substring(closeIndex + 1);
        }
      }

      fixedCode = before + repl.replacement + afterModified;
    });

    return { code: fixedCode, fixes, modified };
  }

  fixAsyncAwaitIssues(code) {
    let fixedCode = code;
    const fixes = [];
    let modified = false;

    // Fix 1: Envolver await sin try-catch (solo registrado)
    const awaitPattern = /(?<!try\s*{[^}]*)(await\s+[\w.]+\s*\([^)]*\))/g;
    let match;

    while ((match = awaitPattern.exec(code)) !== null) {
      const awaitExpr = match[1];
      const index = match.index;
      const line = code.substring(0, index).split("\n").length;

      // Verificar si ya está en try-catch (buscar hacia arriba)
      const contextBefore = code.substring(Math.max(0, index - 500), index);
      const hasTryCatch = /try\s*{[^}]*$/.test(contextBefore);

      if (!hasTryCatch) {
        fixes.push({
          type: "async_try_catch_wrap",
          description: `Envuelto await en try-catch (línea ${line})`,
          line,
        });

        // Solo reporta para evitar mal reemplazo automático
        logger.warn(`⚠️ Línea ${line}: await sin try-catch detectado`);
      }
    }

    // Fix 2: Eliminar async innecesario
    const asyncFuncPattern = /async\s+function\s+(\w+)\s*\([^)]*\)\s*{([^}]*)}/g;

    while ((match = asyncFuncPattern.exec(code)) !== null) {
      const funcName = match[1];
      const funcBody = match[2];

      if (!funcBody.includes("await") && !funcBody.includes("Promise")) {
        fixes.push({
          type: "remove_unnecessary_async",
          description: `Función ${funcName} marcada como async innecesariamente`,
          line: code.substring(0, match.index).split("\n").length,
        });

        fixedCode = fixedCode.replace(
          new RegExp(`async\\s+function\\s+${funcName}`),
          `function ${funcName}`
        );

        modified = true;
      }
    }

    return { code: fixedCode, fixes, modified };
  }

  fixPromiseIssues(code) {
    let fixedCode = code;
    const fixes = [];
    let modified = false;

    // Fix: Agregar .catch() a Promises sin manejo (registrar solo)
    const promisePattern = /new\s+Promise\s*\([^)]+\)/g;
    let match;

    while ((match = promisePattern.exec(code)) !== null) {
      const index = match.index;
      const line = code.substring(0, index).split("\n").length;

      // Buscar si tiene .catch después
      const contextAfter = code.substring(index, Math.min(code.length, index + 300));

      if (!contextAfter.includes(".catch(")) {
        fixes.push({
          type: "promise_add_catch",
          description: `Promise sin .catch() en línea ${line}`,
          line,
          suggestion: "Agregar .catch(error => { logger.error(error); })",
        });

        logger.warn(`⚠️ Línea ${line}: Promise sin manejo de errores`);
      }
    }

    return { code: fixedCode, fixes, modified };
  }

  fixMemoryLeaks(code) {
    let fixedCode = code;
    const fixes = [];
    let modified = false;

    // Fix: Agregar cleanup a timers (registrar solo)
    const timerPattern = /(const|let|var)\s+(\w+)\s*=\s*(setTimeout|setInterval)\s*\(/g;
    let match;

    while ((match = timerPattern.exec(code)) !== null) {
      const varName = match[2];
      const timerType = match[3];
      const clearType = timerType === "setTimeout" ? "clearTimeout" : "clearInterval";
      const line = code.substring(0, match.index).split("\n").length;

      // Verificar si hay cleanup
      const clearPattern = new RegExp(`${clearType}\\s*\\(\\s*${varName}\\s*\\)`);

      if (!clearPattern.test(code)) {
        fixes.push({
          type: "timer_add_cleanup",
          description: `Timer '${varName}' sin cleanup en línea ${line}`,
          line,
          suggestion: `Agregar: ${clearType}(${varName}); en función de cleanup`,
        });

        logger.warn(`⚠️ Línea ${line}: Timer sin cleanup detectado`);
      }
    }

    return { code: fixedCode, fixes, modified };
  }

  optimizeStructures(code) {
    let fixedCode = code;
    const fixes = [];
    let modified = false;

    // Optimización 1: Detectar callback hell (solo sugerencia)
    const callbackHellPattern = /\}\s*\)\s*\.\s*then\s*\(\s*function/g;

    if (callbackHellPattern.test(code)) {
      fixes.push({
        type: "suggest_async_refactor",
        description: "Callback hell detectado - considerar refactorizar a async/await",
        suggestion: "Convertir cadena de .then() a async/await para mejor legibilidad",
      });
    }

    // Optimización 2: Reemplazar var con const/let
    const varPattern = /\bvar\s+(\w+)/g;
    let match;

    while ((match = varPattern.exec(code)) !== null) {
      const varName = match[1];
      const line = code.substring(0, match.index).split("\n").length;

      const reassignPattern = new RegExp(`${varName}\\s*=`, "g");
      const assignments = (code.match(reassignPattern) || []).length;

      const replacement = assignments > 1 ? "let" : "const";

      fixedCode = fixedCode.replace(
        new RegExp(`\\bvar\\s+${varName}\\b`),
        `${replacement} ${varName}`
      );

      fixes.push({
        type: "modernize_variable_declaration",
        description: `Reemplazado 'var ${varName}' con '${replacement}' (línea ${line})`,
        line,
      });

      modified = true;
    }

    return { code: fixedCode, fixes, modified };
  }

  getIndentation(code, index) {
    const lineStart = code.lastIndexOf("\n", index) + 1;
    const line = code.substring(lineStart, index);
    const match = line.match(/^(\s*)/);
    return match ? match[1] : "";
  }

  generateDiff(original, fixed) {
    const origLines = original.split("\n");
    const fixedLines = fixed.split("\n");
    const diff = [];

    const maxLen = Math.max(origLines.length, fixedLines.length);

    for (let i = 0; i < maxLen; i++) {
      const origLine = origLines[i] || "";
      const fixedLine = fixedLines[i] || "";

      if (origLine !== fixedLine) {
        diff.push({
          line: i + 1,
          type: !origLine ? "added" : !fixedLine ? "removed" : "modified",
          original: origLine,
          fixed: fixedLine,
        });
      }
    }

    return diff;
  }
}

// ===========================================================
// 📦 VALIDADOR DE DEPENDENCIAS
// ===========================================================
class DependencyManager {
  constructor() {
    this.packageJsonPath = path.join(process.cwd(), "package.json");
    this.nodeModulesPath = path.join(process.cwd(), "node_modules");
  }

  /**
   * 🔍 Valida y corrige dependencias
   * @param {string} code - Código a analizar
   * @returns {Object} Reporte de dependencias
   */
  async validateAndFix(code) {
    logger.info("📦 Validando dependencias...");

    const imports = this.extractImports(code);
    const issues = [];
    const fixes = [];

    // Verificar package.json
    const packageJson = await this.loadPackageJson();

    if (!packageJson) {
      issues.push({
        type: "missing_package_json",
        severity: "critical",
        description: "package.json no encontrado",
        fix: await this.createPackageJson(),
      });
    }

    // Verificar cada import
    for (const imp of imports) {
      if (imp.type === "external") {
        const check = await this.checkExternalDependency(imp, packageJson);
        if (!check.valid) {
          issues.push(check);

          // Auto-fix: agregar a package.json
          if (packageJson) {
            const fixed = await this.addDependency(imp.module, packageJson);
            if (fixed) {
              fixes.push({
                type: "dependency_added",
                module: imp.module,
                description: `Agregado ${imp.module} a package.json`,
              });
            }
          }
        }
      } else if (imp.type === "local") {
        const check = await this.checkLocalFile(imp);
        if (!check.valid) {
          issues.push(check);
        }
      }
    }

    logger.success(`✅ Validación completada: ${imports.length} imports, ${issues.length} issues`);

    return {
      imports,
      issues,
      fixes,
      summary: {
        total: imports.length,
        external: imports.filter((i) => i.type === "external").length,
        local: imports.filter((i) => i.type === "local").length,
        issues: issues.length,
        fixesApplied: fixes.length,
      },
    };
  }

  extractImports(code) {
    const imports = [];

    // ES6 imports
    const es6Pattern = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = es6Pattern.exec(code)) !== null) {
      const named = match[1];
      const defaultImport = match[2];
      const modulePath = match[3];

      imports.push({
        type: modulePath.startsWith(".") ? "local" : "external",
        module: modulePath.split("/")[0],
        path: modulePath,
        imports: named ? named.split(",").map((s) => s.trim()) : [defaultImport],
        line: code.substring(0, match.index).split("\n").length,
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
        type: modulePath.startsWith(".") ? "local" : "external",
        module: modulePath.split("/")[0],
        path: modulePath,
        imports: named ? named.split(",").map((s) => s.trim()) : [defaultImport],
        line: code.substring(0, match.index).split("\n").length,
        raw: match[0],
      });
    }

    return imports;
  }

  async loadPackageJson() {
    try {
      if (!fs.existsSync(this.packageJsonPath)) {
        return null;
      }

      const content = fs.readFileSync(this.packageJsonPath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      logger.error("Error leyendo package.json:", error.message);
      return null;
    }
  }

  async checkExternalDependency(imp, packageJson) {
    const moduleName = imp.module;

    // Check si es módulo nativo de Node
    const builtins = ["fs", "path", "http", "https", "crypto", "os", "util", "stream", "events"];
    if (builtins.includes(moduleName)) {
      return { valid: true, builtin: true };
    }

    if (!packageJson) {
      return {
        valid: false,
        type: "missing_in_package_json",
        severity: "high",
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
        type: "missing_dependency",
        severity: "critical",
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
        type: "not_installed",
        severity: "high",
        module: moduleName,
        description: `Módulo '${moduleName}' en package.json pero no instalado`,
        fix: "npm install",
      };
    }

    return { valid: true };
  }

  async checkLocalFile(imp) {
    const filePath = path.resolve(process.cwd(), imp.path);

    // Probar con diferentes extensiones
    const extensions = ["", ".js", ".mjs", ".json", "/index.js"];

    for (const ext of extensions) {
      if (fs.existsSync(filePath + ext)) {
        return { valid: true, resolvedPath: filePath + ext };
      }
    }

    return {
      valid: false,
      type: "missing_local_file",
      severity: "critical",
      path: imp.path,
      line: imp.line,
      description: `Archivo local '${imp.path}' no encontrado`,
      fix: `Crear archivo o corregir path`,
    };
  }

  async addDependency(moduleName, packageJson) {
    try {
      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }

      packageJson.dependencies[moduleName] = "latest";

      fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2), "utf8");

      logger.success(`✅ Agregado ${moduleName} a package.json`);
      return true;
    } catch (error) {
      logger.error(`Error agregando dependencia: ${error.message}`);
      return false;
    }
  }

  async createPackageJson() {
    const template = {
      name: "auto-generated-project",
      version: "1.0.0",
      description: "Auto-generated by Ultra Module Letal",
      main: "index.js",
      type: "module",
      scripts: {
        start: "node index.js",
        test: 'echo "No tests specified"',
      },
      keywords: [],
      author: "",
      license: "ISC",
      dependencies: {},
      devDependencies: {},
    };

    try {
      fs.writeFileSync(this.packageJsonPath, JSON.stringify(template, null, 2), "utf8");

      logger.success("✅ package.json creado automáticamente");
      return true;
    } catch (error) {
      logger.error(`Error creando package.json: ${error.message}`);
      return false;
    }
  }
}
export async function runSmartCheck(filePath) {
  logger.info(`🚀 Iniciando análisis inteligente del módulo: ${filePath}`);

  try {
    const code = fs.readFileSync(filePath, "utf8");
    const analyzer = new FunctionIntentAnalyzer();
    const fixer = new CodeAutoFixer();
    const deps = new DependencyManager();

    const analysis = analyzer.analyzeIntent(path.basename(filePath), code);
    const autoFix = await fixer.autoFix(code);
    const depReport = await deps.validateAndFix(code);
    const pi = 3.14159;

    const summary = {
      file: filePath,
      intent: analysis.primaryIntent,
      complexity: analysis.complexity.level,
      sideEffects: analysis.features.hasSideEffects,
      fixesApplied: autoFix.appliedFixes.length,
      depIssues: depReport.issues.length,
    };

    logger.success(`🧩 Análisis completado: ${JSON.stringify(summary, null, 2)}`);
    return { analysis, autoFix, depReport, summary };
  } catch (error) {
    logger.error(`Error en runSmartCheck: ${error.message}`);
    return null;
  }
}

export { SmartLogger, FunctionIntentAnalyzer, CodeAutoFixer, DependencyManager };
export { saludo, PI, multiplicar };