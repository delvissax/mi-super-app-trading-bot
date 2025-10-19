// autoRepair.js - SISTEMA AUTO-REPAIR LETAL ULTRA SEGURO 🔥🛡️
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ===========================================================
// 🎨 COLORES PARA TERMINAL
// ===========================================================
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m'
};

// ===========================================================
// 🛡️ CLASE PRINCIPAL - AUTO REPAIR LETAL
// ===========================================================
class AutoRepairLetal {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.fileName = path.basename(filePath);
    this.backupDir = path.join(__dirname, '.backups');
    this.maxBackups = options.maxBackups || 10;
    this.mode = options.mode || 'preview'; // preview | interactive | auto
    
    this.issues = [];
    this.fixes = [];
    this.appliedFixes = [];
    this.backups = [];
    
    this.originalContent = null;
    this.currentContent = null;
    this.contentHistory = [];
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  colorize(text, colorKey) {
    const color = colors[colorKey] || '';
    return `${color}${text}${colors.reset}`;
  }

  getSeverityIcon(severity) {
    switch(severity) {
      case 'high': return this.colorize('🔴', 'red');
      case 'medium': return this.colorize('🟡', 'yellow');
      case 'low': return this.colorize('🟢', 'green');
      default: return '';
    }
  }

  askQuestion(query) {
    return new Promise(resolve => {
      this.rl.question(query, answer => resolve(answer));
    });
  }

  // ===========================================================
  // 🚀 MÉTODO PRINCIPAL
  // ===========================================================
  async run() {
    try {
      console.log('\n' + '═'.repeat(70));
      console.log(this.colorize(' 🔥 AUTO-REPAIR LETAL - ULTRA SEGURO HÍBRIDO', 'bright'));
      console.log('═'.repeat(70) + '\n');
      console.log("✅ Auto repair activo");


      // PASO 1: Leer archivo
      await this.loadFile();

      // PASO 2: Crear backup inicial
      await this.createBackup('initial');

      // PASO 3: Analizar código
      await this.analyzeCode();

      // PASO 4: Mostrar resumen
      this.printSummary();

      // PASO 5: Ejecutar según modo
      if (this.mode === 'preview') {
        await this.runPreviewMode();
      } else if (this.mode === 'interactive') {
        await this.runInteractiveMode();
      } else if (this.mode === 'auto') {
        await this.runAutoMode();
      }

      // PASO 6: Guardar cambios (si hubo)
      if (this.appliedFixes.length > 0) {
        await this.saveChanges();
      }

      // PASO 7: Generar reporte
      await this.generateReport();

      console.log('\n' + this.colorize('✅ Auto-Repair completado exitosamente!', 'green'));
      console.log('═'.repeat(70) + '\n');

      this.rl.close();
      return {
        success: true,
        issuesFound: this.issues.length,
        fixesApplied: this.appliedFixes.length,
        backupsCreated: this.backups.length
      };

    } catch (error) {
      console.error('\n' + this.colorize(`❌ Error fatal: ${error.message}`, 'red'));
      this.rl.close();
      return { success: false, error: error.message };
    }
  }

  // ===========================================================
  // 📂 CARGAR ARCHIVO
  // ===========================================================
  async loadFile() {
    console.log(this.colorize('📂 Cargando archivo...', 'blue'));

    if (!fs.existsSync(this.filePath)) {
      throw new Error(`Archivo no encontrado: ${this.filePath}`);
    }

    this.originalContent = fs.readFileSync(this.filePath, 'utf8');
    this.currentContent = this.originalContent;
    this.contentHistory.push({
      timestamp: Date.now(),
      content: this.originalContent,
      action: 'initial_load'
    });

    const lines = this.originalContent.split('\n').length;
    const size = (Buffer.byteLength(this.originalContent) / 1024).toFixed(2);

    console.log(this.colorize(`   ✅ Archivo cargado: ${this.fileName}`, 'green'));
    console.log(this.colorize(`   📊 ${lines} líneas | ${size} KB\n`, 'dim'));
  }

  // ===========================================================
  // 💾 SISTEMA DE BACKUPS
  // ===========================================================
  async createBackup(label = 'auto') {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const hash = crypto.createHash('md5').update(this.currentContent).digest('hex').substring(0, 8);
    const backupName = `${this.fileName}.${label}.${timestamp}.${hash}.backup`;
    const backupPath = path.join(this.backupDir, backupName);

    fs.writeFileSync(backupPath, this.currentContent, 'utf8');

    this.backups.push({
      path: backupPath,
      name: backupName,
      timestamp: Date.now(),
      label,
      hash
    });

    // Limpiar backups viejos
    await this.cleanOldBackups();

    console.log(this.colorize(`   💾 Backup creado: ${backupName}`, 'dim'));

    return backupPath;
  }

  async cleanOldBackups() {
    const backupFiles = fs.readdirSync(this.backupDir)
      .filter(f => f.startsWith(this.fileName))
      .map(f => ({
        name: f,
        path: path.join(this.backupDir, f),
        mtime: fs.statSync(path.join(this.backupDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (backupFiles.length > this.maxBackups) {
      const toDelete = backupFiles.slice(this.maxBackups);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(this.colorize(`   🗑️  Backup antiguo eliminado: ${file.name}`, 'dim'));
      });
    }
  }

  // ===========================================================
  // 🔍 ANÁLISIS DE CÓDIGO
  // ===========================================================
  async analyzeCode() {
    console.log(this.colorize('\n🔍 Analizando código...', 'blue'));
    console.log('─'.repeat(70));

    const checks = [
      { name: 'Sintaxis y Balance', fn: () => this.checkSyntax() },
      { name: 'Funciones Duplicadas', fn: () => this.checkDuplicateFunctions() },
      { name: 'Bloques Sin Cerrar', fn: () => this.checkUnclosedBlocks() },
      { name: 'Variables No Definidas', fn: () => this.checkUndefinedVariables() },
      { name: 'Imports/Exports', fn: () => this.checkImportsExports() },
      { name: 'Memory Leaks', fn: () => this.checkMemoryLeaks() },
      { name: 'Código Muerto', fn: () => this.checkDeadCode() }
    ];

    for (const check of checks) {
      process.stdout.write(`   ${check.name}... `);
      const result = await check.fn();
      console.log(result ? this.colorize('✓', 'green') : this.colorize('✗', 'yellow'));
    }

    console.log('─'.repeat(70));
    console.log(this.colorize(`   📊 Issues encontrados: ${this.issues.length}`, 'yellow'));
    console.log(this.colorize(`   💡 Fixes disponibles: ${this.fixes.length}\n`, 'green'));
  }

  // ===========================================================
  // 🔧 CHECKS INDIVIDUALES
  // ===========================================================
  checkSyntax() {
    const content = this.currentContent;
    const counts = {
      '{': (content.match(/\{/g) || []).length,
      '}': (content.match(/\}/g) || []).length,
      '(': (content.match(/\(/g) || []).length,
      ')': (content.match(/\)/g) || []).length,
      '[': (content.match(/\[/g) || []).length,
      ']': (content.match(/\]/g) || []).length,
    };

    let hasIssues = false;

    if (counts['{'] !== counts['}']) {
      const diff = counts['{'] - counts['}'];
      const issueId = `syntax-braces-${Date.now()}`;
      this.issues.push({
        id: issueId,
        type: 'syntax',
        severity: 'high',
        title: 'Llaves desbalanceadas',
        description: `${Math.abs(diff)} llave(s) ${diff > 0 ? 'sin cerrar' : 'de más'}`,
        details: {
          open: counts['{'],
          close: counts['}'],
          diff: diff
        }
      });

      this.fixes.push({
        issueId,
        type: 'auto',
        action: 'balance_braces',
        description: `${diff > 0 ? 'Agregar' : 'Eliminar'} ${Math.abs(diff)} llave(s)`,
        confidence: 0.7,
        apply: () => this.fixBalanceBraces(diff)
      });

      hasIssues = true;
    }

    if (counts['('] !== counts[')']) {
      const diff = counts['('] - counts[')'];
      this.issues.push({
        id: `syntax-parens-${Date.now()}`,
        type: 'syntax',
        severity: 'high',
        title: 'Paréntesis desbalanceados',
        description: `${Math.abs(diff)} paréntesis ${diff > 0 ? 'sin cerrar' : 'de más'}`,
        details: {
          open: counts['('],
          close: counts[')'],
          diff: diff
        }
      });

      hasIssues = true;
    }

    if (counts['['] !== counts[']']) {
      const diff = counts['['] - counts[']'];
      this.issues.push({
        id: `syntax-brackets-${Date.now()}`,
        type: 'syntax',
        severity: 'high',
        title: 'Corchetes desbalanceados',
        description: `${Math.abs(diff)} corchete(s) ${diff > 0 ? 'sin cerrar' : 'de más'}`,
        details: {
          open: counts['['],
          close: counts[']'],
          diff: diff
        }
      });

      hasIssues = true;
    }

    return !hasIssues;
  }

  checkDuplicateFunctions() {
    const functionPattern = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(|let\s+(\w+)\s*=\s*(?:async\s*)?\()/g;
    const functions = new Map();
    const lines = this.currentContent.split('\n');
    let match;
    let currentLine;

    const content = this.currentContent;

    while ((match = functionPattern.exec(content)) !== null) {
      const funcName = match[1] || match[2] || match[3];
      if (funcName) {
        const beforeMatch = content.substring(0, match.index);
        currentLine = beforeMatch.split('\n').length;

        if (!functions.has(funcName)) {
          functions.set(funcName, []);
        }

        functions.get(funcName).push({
          line: currentLine,
          match: match[0],
          index: match.index
        });
      }
    }

    const duplicates = Array.from(functions.entries())
      .filter(([name, occurrences]) => occurrences.length > 1);

    if (duplicates.length > 0) {
      duplicates.forEach(([name, occurrences]) => {
        const issueId = `duplicate-func-${name}-${Date.now()}`;
        this.issues.push({
          id: issueId,
          type: 'duplicate',
          severity: 'medium',
          title: `Función duplicada: ${name}()`,
          description: `Encontrada ${occurrences.length} veces`,
          details: {
            functionName: name,
            occurrences: occurrences.map(o => ({
              line: o.line,
              preview: lines[o.line - 1]?.substring(0, 60) + '...'
            }))
          }
        });

        this.fixes.push({
          issueId,
          type: 'interactive',
          action: 'merge_or_remove_duplicate',
          description: `Eliminar duplicados de ${name}()`,
          confidence: 0.6,
          requiresInput: true,
          apply: (choice) => this.fixDuplicateFunction(name, occurrences, choice)
        });
      });

      return false;
    }

    return true;
  }

  checkUnclosedBlocks() {
    const lines = this.currentContent.split('\n');
    const stack = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      // Detectar aperturas
      if (/^\s*(if|for|while|function|class|try|catch)\s*\(/.test(trimmed)) {
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        
        if (openBraces > closeBraces) {
          stack.push({ type: 'block', line: idx + 1, content: trimmed });
        }
      }

      // Detectar arrow functions
      if (/=>\s*\{/.test(trimmed)) {
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        
        if (openBraces > closeBraces) {
          stack.push({ type: 'arrow', line: idx + 1, content: trimmed });
        }
      }

      // Detectar cierres
      const closeBraces = (line.match(/\}/g) || []).length;
      for (let i = 0; i < closeBraces; i++) {
        if (stack.length > 0) {
          stack.pop();
        }
      }
    });

    if (stack.length > 0) {
      this.issues.push({
        id: `unclosed-blocks-${Date.now()}`,
        type: 'structure',
        severity: 'high',
        title: 'Bloques sin cerrar',
        description: `${stack.length} bloque(s) potencialmente sin cerrar`,
        details: {
          unclosed: stack.map(s => ({
            line: s.line,
            type: s.type,
            preview: s.content.substring(0, 50) + '...'
          }))
        }
      });

      return false;
    }

    return true;
  }

  checkUndefinedVariables() {
    const requiredGlobals = [
      'broadcast',
      'getActiveWebSocketClients',
      'getTotalWebSocketClients',
      'metrics'
    ];

    const content = this.currentContent;
    const missingGlobals = [];

    requiredGlobals.forEach(varName => {
      const usagePattern = new RegExp(`\\b${varName}\\b`, 'g');
      const definitionPattern = new RegExp(`(const|let|var|global\\.${varName}|function)\\s+${varName}`, 'g');

      const usages = (content.match(usagePattern) || []).length;
      const definitions = (content.match(definitionPattern) || []).length;

      if (usages > 0 && definitions === 0) {
        missingGlobals.push({
          name: varName,
          usages: usages
        });
      }
    });

    if (missingGlobals.length > 0) {
      missingGlobals.forEach(v => {
        this.issues.push({
          id: `undefined-var-${v.name}-${Date.now()}`,
          type: 'reference',
          severity: 'medium',
          title: `Variable no definida: ${v.name}`,
          description: `Usada ${v.usages} veces pero no está definida`,
          details: {
            variableName: v.name,
            usageCount: v.usages
          }
        });

        this.fixes.push({
          issueId: `undefined-var-${v.name}-${Date.now()}`,
          type: 'manual',
          action: 'define_variable',
          description: `Definir variable ${v.name}`,
          confidence: 0.5,
          requiresInput: true,
          apply: () => {
            // Dejar para implementación manual por usuario
            return Promise.resolve();
          }
        });
      });

      return false;
    }

    return true;
  }

  checkImportsExports() {
    const content = this.currentContent;
    const imports = [];

    // Detectar imports
    const importPattern = /import\s+(?:{[^}]+}|[\w]+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      imports.push({
        module: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    // Verificar si hay imports después de código ejecutable
    const firstImportLine = imports[0]?.line || Infinity;
    const lines = content.split('\n');
    
    for (let i = 0; i < Math.min(firstImportLine, lines.length); i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('//') && !line.startsWith('/*') && 
          !line.startsWith('import') && line !== '' && !line.startsWith('*')) {
        this.issues.push({
          id: `import-order-${Date.now()}`,
          type: 'style',
          severity: 'low',
          title: 'Orden de imports incorrecto',
          description: `Hay código ejecutable antes de los imports (línea ${i + 1})`,
          details: {
            line: i + 1,
            preview: line.substring(0, 60)
          }
        });

        return false;
      }
    }

    return true;
  }

  checkMemoryLeaks() {
    const content = this.currentContent;
    const potentialLeaks = [];

    // Buscar setInterval sin clearInterval
    const intervalPattern = /setInterval\s*\(/g;
    const clearIntervalPattern = /clearInterval\s*\(/g;

    const intervals = (content.match(intervalPattern) || []).length;
    const clears = (content.match(clearIntervalPattern) || []).length;

    if (intervals > clears) {
      potentialLeaks.push({
        type: 'interval',
        count: intervals - clears
      });
    }

    // Buscar event listeners sin removeEventListener
    const addListenerPattern = /addEventListener\s*\(/g;
    const removeListenerPattern = /removeEventListener\s*\(/g;

    const adds = (content.match(addListenerPattern) || []).length;
    const removes = (content.match(removeListenerPattern) || []).length;

    if (adds > removes) {
      potentialLeaks.push({
        type: 'listener',
        count: adds - removes
      });
    }

    if (potentialLeaks.length > 0) {
      potentialLeaks.forEach(leak => {
        this.issues.push({
          id: `memory-leak-${leak.type}-${Date.now()}`,
          type: 'performance',
          severity: 'medium',
          title: `Posible memory leak: ${leak.type}`,
          description: `${leak.count} ${leak.type}(s) sin limpiar`,
          details: leak
        });
      });

      return false;
    }

    return true;
  }

  checkDeadCode() {
    const lines = this.currentContent.split('\n');
    const deadCodeIssues = [];

    // Buscar return statements seguidos de código
    lines.forEach((line, idx) => {
      if (/^\s*return\b/.test(line) && idx < lines.length - 1) {
        const nextLine = lines[idx + 1].trim();
        if (nextLine && !nextLine.startsWith('}') && !nextLine.startsWith('//')) {
          deadCodeIssues.push({
            line: idx + 2,
            type: 'unreachable_after_return',
            preview: nextLine.substring(0, 60)
          });
        }
      }
    });

    if (deadCodeIssues.length > 0) {
      deadCodeIssues.forEach(issue => {
        this.issues.push({
          id: `dead-code-${issue.line}-${Date.now()}`,
          type: 'quality',
          severity: 'low',
          title: 'Código inalcanzable',
          description: `Código después de return en línea ${issue.line}`,
          details: issue
        });

        this.fixes.push({
          issueId: `dead-code-${issue.line}-${Date.now()}`,
          type: 'auto',
          action: 'remove_dead_code',
          description: `Eliminar código inalcanzable en línea ${issue.line}`,
          confidence: 0.9,
          apply: () => this.fixRemoveDeadCode(issue.line)
        });
      });

      return false;
    }

    return true;
  }

  // ===========================================================
  // 📊 RESUMEN
  // ===========================================================
  printSummary() {
    console.log('\n' + '═'.repeat(70));
    console.log(this.colorize('  📊 RESUMEN DEL ANÁLISIS', 'bright'));
    console.log('═'.repeat(70) + '\n');

    if (this.issues.length === 0) {
      console.log(this.colorize('   ✅ ¡Código perfecto! No se encontraron problemas.\n', 'green'));
      return;
    }

    // Agrupar por severidad
    const bySeverity = {
      high: this.issues.filter(i => i.severity === 'high'),
      medium: this.issues.filter(i => i.severity === 'medium'),
      low: this.issues.filter(i => i.severity === 'low')
    };

    if (bySeverity.high.length > 0) {
      console.log(this.colorize(`   🔴 CRÍTICOS (${bySeverity.high.length}):`, 'red'));
      bySeverity.high.slice(0, 3).forEach(issue => {
        console.log(`      • ${issue.title}`);
        console.log(this.colorize(`        ${issue.description}`, 'dim'));
      });
      if (bySeverity.high.length > 3) {
        console.log(this.colorize(`      ... y ${bySeverity.high.length - 3} más`, 'dim'));
      }
      console.log('');
    }

    if (bySeverity.medium.length > 0) {
      console.log(this.colorize(`   🟡 MEDIANOS (${bySeverity.medium.length}):`, 'yellow'));
      bySeverity.medium.slice(0, 3).forEach(issue => {
        console.log(`      • ${issue.title}`);
      });
      if (bySeverity.medium.length > 3) {
        console.log(this.colorize(`      ... y ${bySeverity.medium.length - 3} más`, 'dim'));
      }
      console.log('');
    }

    if (bySeverity.low.length > 0) {
      console.log(this.colorize(`   🟢 MENORES (${bySeverity.low.length}):`, 'green'));
      bySeverity.low.slice(0, 2).forEach(issue => {
        console.log(`      • ${issue.title}`);
      });
      if (bySeverity.low.length > 2) {
        console.log(this.colorize(`      ... y ${bySeverity.low.length - 2} más`, 'dim'));
      }
      console.log('');
    }

    // Fixes disponibles
    const autoFixes = this.fixes.filter(f => f.type === 'auto').length;
    const interactiveFixes = this.fixes.filter(f => f.type === 'interactive').length;
    const manualFixes = this.fixes.filter(f => f.type === 'manual').length;

    console.log(this.colorize('   💡 FIXES DISPONIBLES:', 'blue'));
    if (autoFixes > 0) {
      console.log(`      • ${autoFixes} automáticos (alta confianza)`);
    }
    if (interactiveFixes > 0) {
      console.log(`      • ${interactiveFixes} interactivos (requieren tu decisión)`);
    }
    if (manualFixes > 0) {
      console.log(`      • ${manualFixes} manuales (requieren edición)`);
    }
    console.log('');

    console.log('═'.repeat(70) + '\n');
  }

  // ===========================================================
  // 🎯 MODO PREVIEW
  // ===========================================================
  async runPreviewMode() {
    console.log(this.colorize('🔍 MODO PREVIEW - No se modificará ningún archivo', 'blue'));
    console.log('─'.repeat(70) + '\n');

    console.log('Este es un resumen de los cambios que SE PODRÍAN aplicar:');
    console.log('Para aplicar cambios, ejecuta en modo INTERACTIVE o AUTO.\n');

    console.log(this.colorize('Comando para modo interactivo:', 'yellow'));
    console.log(`   node autoRepair.js --mode interactive ${this.fileName}\n`);

    console.log(this.colorize('Comando para modo automático (con confirmación):', 'yellow'));
    console.log(`   node autoRepair.js --mode auto ${this.fileName}\n`);

    // Guardar reporte HTML
    await this.generateHTMLReport();
  }

  // ===========================================================
  // 🎮 MODO INTERACTIVO
  // ===========================================================
  async runInteractiveMode() {
    console.log(this.colorize('\n🎮 MODO INTERACTIVO - Tú decides cada cambio', 'blue'));
    console.log('═'.repeat(70) + '\n');

    if (this.issues.length === 0) {
      console.log(this.colorize('   ✅ No hay issues para corregir!\n', 'green'));
      return;
    }

    for (let i = 0; i < this.issues.length; i++) {
      const issue = this.issues[i];
      const relatedFixes = this.fixes.filter(f => f.issueId === issue.id);

      console.log('\n' + '─'.repeat(70));
      console.log(this.colorize(`\n📍 Issue ${i + 1} de ${this.issues.length}`, 'bright'));
      console.log('─'.repeat(70));
      
      console.log(`\n${this.getSeverityIcon(issue.severity)} ${this.colorize(issue.title, 'bright')}`);
      console.log(`   ${issue.description}`);
      
      if (issue.details) {
        console.log(this.colorize('\n   Detalles:', 'dim'));
        console.log(`   ${JSON.stringify(issue.details, null, 2).split('\n').join('\n   ')}`);
      }

      if (relatedFixes.length > 0) {
        console.log(this.colorize('\n   💡 Fixes disponibles:', 'blue'));
        relatedFixes.forEach((fix, idx) => {
          const confidence = Math.round(fix.confidence * 100);
          console.log(`   ${idx + 1}) ${fix.description} (Confianza: ${confidence}%)`);
        });

        const answer = await this.askQuestion('\n¿Qué deseas hacer? [1-' + relatedFixes.length + ' / s=Skip / v=Ver más / q=Salir]: ');

        if (answer.toLowerCase() === 'q') {
          console.log('\n' + this.colorize('👋 Saliendo del modo interactivo...', 'yellow'));
          break;
        } else if (answer.toLowerCase() === 's') {
          console.log(this.colorize('   ⏭️  Saltado', 'yellow'));
          continue;
        } else if (answer.toLowerCase() === 'v') {
          await this.showMoreContext(issue);
          i--; // Repetir este issue
          continue;
        } else {
          const choice = parseInt(answer);
          if (!isNaN(choice) && choice >= 1 && choice <= relatedFixes.length) {
            const selectedFix = relatedFixes[choice - 1];
            
            console.log(this.colorize(`\n   🔧 Aplicando: ${selectedFix.description}`, 'blue'));
            
            // Crear backup antes del cambio
            await this.createBackup(`fix-${i + 1}`);
            
            try {
              await selectedFix.apply();
              
              this.appliedFixes.push({
                issueId: issue.id,
                fix: selectedFix,
                timestamp: Date.now()
              });
              
              console.log(this.colorize('   ✅ Fix aplicado exitosamente!', 'green'));
              
            } catch (error) {
              console.log(this.colorize(`   ❌ Error aplicando fix: ${error.message}`, 'red'));
              
              // Rollback
              const rollback = await this.askQuestion('   ¿Revertir cambio? [y/n]: ');
              if (rollback.toLowerCase() === 'y') {
                await this.rollbackLastChange();
                console.log(this.colorize('   ↩️  Cambio revertido', 'yellow'));
              }
            }
          } else {
            console.log(this.colorize('   ⚠️  Opción inválida, saltando...', 'yellow'));
          }
        }
      } else {
        console.log(this.colorize('\n   ℹ️  No hay fixes automáticos disponibles para este issue', 'dim'));
        console.log(this.colorize('   💡 Se requiere corrección manual\n', 'dim'));
        
        const skip = await this.askQuestion('Presiona Enter para continuar...');
      }
    }

    console.log('\n' + '═'.repeat(70));
    console.log(this.colorize(`\n✅ Modo interactivo completado!`, 'green'));
    console.log(`   Fixes aplicados: ${this.appliedFixes.length}`);
    console.log('═'.repeat(70) + '\n');
  }

  // ===========================================================
  // 🤖 MODO AUTOMÁTICO
  // ===========================================================
  async runAutoMode() {
    console.log(this.colorize('\n🤖 MODO AUTOMÁTICO - Con confirmación de seguridad', 'blue'));
    console.log('═'.repeat(70) + '\n');

    if (this.issues.length === 0) {
      console.log(this.colorize('   ✅ No hay issues para corregir!\n', 'green'));
      return;
    }

    // Filtrar solo fixes automáticos con alta confianza
    const autoFixes = this.fixes.filter(f => f.type === 'auto' && f.confidence >= 0.7);

    if (autoFixes.length === 0) {
      console.log(this.colorize('   ⚠️  No hay fixes automáticos disponibles', 'yellow'));
      console.log(this.colorize('   💡 Intenta el modo interactivo para más opciones\n', 'dim'));
      return;
    }

    console.log(`Se encontraron ${autoFixes.length} fixes automáticos (confianza >= 70%):\n`);

    autoFixes.forEach((fix, idx) => {
      const relatedIssue = this.issues.find(i => i.id === fix.issueId);
      console.log(`   ${idx + 1}. ${fix.description}`);
      console.log(this.colorize(`      Issue: ${relatedIssue?.title}`, 'dim'));
      console.log(this.colorize(`      Confianza: ${Math.round(fix.confidence * 100)}%\n`, 'dim'));
    });

    const confirm = await this.askQuestion(this.colorize('\n⚠️  ¿Aplicar TODOS estos fixes? [y/n]: ', 'yellow'));

    if (confirm.toLowerCase() !== 'y') {
      console.log(this.colorize('\n   ❌ Operación cancelada\n', 'yellow'));
      return;
    }

    console.log(this.colorize('\n🚀 Aplicando fixes automáticos...\n', 'blue'));

    // Crear backup antes de empezar
    await this.createBackup('auto-before-all');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < autoFixes.length; i++) {
      const fix = autoFixes[i];

      process.stdout.write(`   ${i + 1}/${autoFixes.length} ${fix.description}... `);

      try {
        await fix.apply();

        this.appliedFixes.push({
          issueId: fix.issueId,
          fix: fix,
          timestamp: Date.now()
        });

        console.log(this.colorize('✓', 'green'));
        successCount++;

        // Backup incremental
        if (i % 5 === 0) {
          await this.createBackup(`auto-checkpoint-${i}`);
        }

      } catch (error) {
        console.log(this.colorize('✗', 'red'));
        console.log(this.colorize(`      Error: ${error.message}`, 'red'));
        failCount++;
      }
    }

    console.log('\n' + '─'.repeat(70));
    console.log(this.colorize(`\n✅ Modo automático completado!`, 'green'));
    console.log(`   Éxitos: ${successCount}`);
    console.log(`   Fallos: ${failCount}`);
    console.log('═'.repeat(70) + '\n');

    if (failCount > 0) {
      console.log(this.colorize('⚠️  Algunos fixes fallaron. Revisa el reporte para más detalles.\n', 'yellow'));
    }
  }

  // ===========================================================
  // 🔧 MÉTODOS DE CORRECCIÓN
  // ===========================================================
  async fixBalanceBraces(diff) {
    const lines = this.currentContent.split('\n');
    
    if (diff > 0) {
      // Faltan llaves de cierre
      const lastNonEmptyLine = lines.findLastIndex(l => l.trim() !== '');
      
      for (let i = 0; i < diff; i++) {
        lines.splice(lastNonEmptyLine + 1 + i, 0, '}');
      }
      
      this.currentContent = lines.join('\n');
      
      console.log(this.colorize(`\n      ✅ Se agregaron ${diff} llave(s) de cierre al final`, 'green'));
      
    } else {
      // Sobran llaves de cierre
      const toRemove = Math.abs(diff);
      let removed = 0;
      
      for (let i = lines.length - 1; i >= 0 && removed < toRemove; i--) {
        if (lines[i].trim() === '}') {
          lines.splice(i, 1);
          removed++;
        }
      }
      
      this.currentContent = lines.join('\n');
      
      console.log(this.colorize(`\n      ✅ Se eliminaron ${removed} llave(s) de cierre sobrantes`, 'green'));
    }
  }

  async fixDuplicateFunction(name, occurrences, choice) {
    const lines = this.currentContent.split('\n');
    
    console.log(this.colorize(`\n      🔍 Duplicados de ${name}():`, 'blue'));
    occurrences.forEach((occ, idx) => {
      console.log(`\n      ${idx + 1}) Línea ${occ.line}:`);
      console.log(this.colorize(`         ${lines[occ.line - 1]}`, 'dim'));
      
      for (let i = 1; i <= 5 && occ.line + i < lines.length; i++) {
        console.log(this.colorize(`         ${lines[occ.line - 1 + i]}`, 'dim'));
      }
    });

    const keep = await this.askQuestion(`\n      ¿Cuál quieres MANTENER? [1-${occurrences.length}]: `);
    const keepIndex = parseInt(keep) - 1;

    if (isNaN(keepIndex) || keepIndex < 0 || keepIndex >= occurrences.length) {
      throw new Error('Opción inválida');
    }

    let removed = 0;
    for (let i = 0; i < occurrences.length; i++) {
      if (i !== keepIndex) {
        const lineToRemove = occurrences[i].line - 1 - removed;

        let endLine = lineToRemove;
        let braceCount = 0;
        let started = false;

        for (let j = lineToRemove; j < lines.length; j++) {
          const line = lines[j];
          const openBraces = (line.match(/\{/g) || []).length;
          const closeBraces = (line.match(/\}/g) || []).length;

          if (openBraces > 0) started = true;
          braceCount += openBraces - closeBraces;

          if (started && braceCount === 0) {
            endLine = j;
            break;
          }
        }

        const linesToRemove = endLine - lineToRemove + 1;
        lines.splice(lineToRemove, linesToRemove);
        removed += linesToRemove;
      }
    }

    this.currentContent = lines.join('\n');
    console.log(this.colorize(`\n      ✅ Eliminados ${occurrences.length - 1} duplicado(s) de ${name}()`, 'green'));
  }

  async fixRemoveDeadCode(line) {
    const lines = this.currentContent.split('\n');
    lines.splice(line - 1, 1);
    this.currentContent = lines.join('\n');
    
    console.log(this.colorize(`      ✅ Código muerto eliminado en línea ${line}`, 'green'));
  }

  // ===========================================================
  // 💾 GUARDAR CAMBIOS
  // ===========================================================
  async saveChanges() {
    console.log(this.colorize('\n💾 Guardando cambios...', 'blue'));
    
    // Crear backup final
    await this.createBackup('before-save');

    // Guardar archivo
    fs.writeFileSync(this.filePath, this.currentContent, 'utf8');

    const changesSummary = this.detectChanges();
    
    console.log(this.colorize('   ✅ Archivo guardado exitosamente!', 'green'));
    console.log(this.colorize(`   📊 Cambios aplicados: ${this.appliedFixes.length}`, 'dim'));
    console.log(this.colorize(`   📝 Líneas modificadas: ~${changesSummary.linesChanged}`, 'dim'));
    console.log(this.colorize(`   💾 Backups creados: ${this.backups.length}\n`, 'dim'));
  }

  detectChanges() {
    const originalLines = this.originalContent.split('\n');
    const currentLines = this.currentContent.split('\n');
    
    let linesChanged = 0;
    const maxLen = Math.max(originalLines.length, currentLines.length);
    
    for (let i = 0; i < maxLen; i++) {
      if (originalLines[i] !== currentLines[i]) {
        linesChanged++;
      }
    }

    return {
      linesChanged,
      originalLength: originalLines.length,
      currentLength: currentLines.length,
      lineDiff: currentLines.length - originalLines.length
    };
  }

  // ===========================================================
  // 📄 GENERAR REPORTE
  // ===========================================================
  async generateReport() {
    const reportPath = path.join(__dirname, `auto-repair-report-${Date.now()}.txt`);
    
    let report = '';
    report += '═'.repeat(70) + '\n';
    report += '  AUTO-REPAIR REPORT - TRADING BOT LETAL\n';
    report += '═'.repeat(70) + '\n\n';
    
    report += `Archivo: ${this.fileName}\n`;
    report += `Fecha: ${new Date().toISOString()}\n`;
    report += `Modo: ${this.mode.toUpperCase()}\n\n`;
    
    report += '─'.repeat(70) + '\n';
    report += 'RESUMEN\n';
    report += '─'.repeat(70) + '\n';
    report += `Issues encontrados: ${this.issues.length}\n`;
    report += `Fixes disponibles: ${this.fixes.length}\n`;
    report += `Fixes aplicados: ${this.appliedFixes.length}\n`;
    report += `Backups creados: ${this.backups.length}\n\n`;
    
    if (this.issues.length > 0) {
      report += '─'.repeat(70) + '\n';
      report += 'ISSUES DETECTADOS\n';
      report += '─'.repeat(70) + '\n\n';
      
      this.issues.forEach((issue, idx) => {
        report += `${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}\n`;
        report += `   ${issue.description}\n`;
        if (issue.details) {
          report += `   Detalles: ${JSON.stringify(issue.details, null, 2)}\n`;
        }
        report += '\n';
      });
    }
    
    if (this.appliedFixes.length > 0) {
      report += '─'.repeat(70) + '\n';
      report += 'FIXES APLICADOS\n';
      report += '─'.repeat(70) + '\n\n';
      
      this.appliedFixes.forEach((applied, idx) => {
        report += `${idx + 1}. ${applied.fix.description}\n`;
        report += `   Timestamp: ${new Date(applied.timestamp).toISOString()}\n`;
        report += `   Confianza: ${Math.round(applied.fix.confidence * 100)}%\n\n`;
      });
    }
    
    if (this.backups.length > 0) {
      report += '─'.repeat(70) + '\n';
      report += 'BACKUPS CREADOS\n';
      report += '─'.repeat(70) + '\n\n';
      
      this.backups.forEach((backup, idx) => {
        report += `${idx + 1}. ${backup.name}\n`;
        report += `   Ubicación: ${backup.path}\n`;
        report += `   Hash: ${backup.hash}\n\n`;
      });
    }
    
    const changes = this.detectChanges();
    report += '─'.repeat(70) + '\n';
    report += 'ESTADÍSTICAS DE CAMBIOS\n';
    report += '─'.repeat(70) + '\n';
    report += `Líneas originales: ${changes.originalLength}\n`;
    report += `Líneas actuales: ${changes.currentLength}\n`;
    report += `Diferencia: ${changes.lineDiff > 0 ? '+' : ''}${changes.lineDiff}\n`;
    report += `Líneas modificadas: ~${changes.linesChanged}\n\n`;
    
    report += '═'.repeat(70) + '\n';
    report += 'FIN DEL REPORTE\n';
    report += '═'.repeat(70) + '\n';
    
    fs.writeFileSync(reportPath, report, 'utf8');
    
    console.log(this.colorize(`📄 Reporte generado: ${path.basename(reportPath)}`, 'blue'));
    console.log(this.colorize(`   Ubicación: ${reportPath}\n`, 'dim'));

    return reportPath;
  }

  async generateHTMLReport() {
    const reportPath = path.join(__dirname, `auto-repair-report-${Date.now()}.html`);
    
    const issuesHtml = this.issues.map(issue => `
      <div class="issue ${issue.severity}">
        <div class="issue-title">${this.getSeverityIcon(issue.severity)} ${issue.title}</div>
        <div class="issue-desc">${issue.description}</div>
        ${issue.details ? `<pre>${JSON.stringify(issue.details, null, 2)}</pre>` : ''}
      </div>
    `).join('\n');

    const autoFixesCount = this.fixes.filter(f => f.type === 'auto').length;
    const interactiveFixesCount = this.fixes.filter(f => f.type === 'interactive').length;
    const manualFixesCount = this.fixes.filter(f => f.type === 'manual').length;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Auto-Repair Report - ${this.fileName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
      padding: 30px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 12px 12px 0 0;
      margin-bottom: 30px;
    }
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .header p { opacity: 0.9; font-size: 1.1em; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .stat-card .number {
      font-size: 2.5em;
      font-weight: bold;
      color: #667eea;
    }
    .stat-card .label {
      color: #666;
      margin-top: 5px;
      font-size: 0.9em;
    }
    .issue {
      background: white;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 6px;
      border-left: 4px solid #ffc107;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .issue.high { border-left-color: #dc3545; }
    .issue.medium { border-left-color: #ffc107; }
    .issue.low { border-left-color: #28a745; }
    .issue-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .issue-desc { color: #666; font-size: 0.95em; }
    pre {
      background: #f4f4f4;
      padding: 10px;
      border-radius: 6px;
      max-height: 200px;
      overflow-y: auto;
      font-size: 0.9em;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Auto-Repair Report</h1>
      <p>Archivo: ${this.fileName}</p>
      <p>Fecha: ${new Date().toLocaleString()}</p>
      <p>Modo: ${this.mode.toUpperCase()}</p>
    </div>

    <div class="summary">
      <div class="stat-card">
        <div class="number">${this.issues.length}</div>
        <div class="label">Issues encontrados</div>
      </div>
      <div class="stat-card">
        <div class="number">${this.fixes.length}</div>
        <div class="label">Fixes disponibles</div>
      </div>
      <div class="stat-card">
        <div class="number">${this.appliedFixes.length}</div>
        <div class="label">Fixes aplicados</div>
      </div>
      <div class="stat-card">
        <div class="number">${this.backups.length}</div>
        <div class="label">Backups creados</div>
      </div>
      <div class="stat-card">
        <div class="number">${autoFixesCount}</div>
        <div class="label">Fixes automáticos</div>
      </div>
      <div class="stat-card">
        <div class="number">${interactiveFixesCount}</div>
        <div class="label">Fixes interactivos</div>
      </div>
      <div class="stat-card">
        <div class="number">${manualFixesCount}</div>
        <div class="label">Fixes manuales</div>
      </div>
    </div>

    <section>
      <h2>Issues Detectados</h2>
      ${issuesHtml}
    </section>
  </div>
</body>
</html>
    `;

    fs.writeFileSync(reportPath, html, 'utf8');

    console.log(this.colorize(`📄 Reporte HTML generado: ${path.basename(reportPath)}`, 'blue'));
    console.log(this.colorize(`   Ubicación: ${reportPath}\n`, 'dim'));

    return reportPath;
  }

  // ===========================================================
  // Otras utilidades (rollback, mostrar contexto) que también puedes agregar
  // para completar funcionalidad según necesites
}

export default AutoRepairLetal;
