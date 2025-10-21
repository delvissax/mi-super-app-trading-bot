// fixIndex.js
import fs from "fs/promises";
import { CodeAutoFixer, SmartLogger } from "./mod.js";

const logger = new SmartLogger();

async function runAutoFix() {
  try {
    logger.info("🔄 Leyendo archivo index.js para corrección automática...");
    const code = await fs.readFile("./index.js", "utf8");

    const fixer = new CodeAutoFixer();
    const result = await fixer.autoFix(code);

    await fs.writeFile("./index_fixed.js", result.fixed);
    logger.success("✅ Revisión completa. Archivo corregido guardado como index_fixed.js");
  } catch (error) {
    logger.error("❌ Error durante la corrección automática:", error);
    process.exit(1);
  }
}

runAutoFix();
