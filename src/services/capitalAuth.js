import dotenv from "dotenv";
dotenv.config();

/**
 * Devuelve los headers de autenticación para Capital.com
 * @param {boolean} isDemo - true si es demo, false si es real
 * @returns {object} headers con API Key
 */
export function getAuthHeaders(isDemo = true) {
  const apiKey = isDemo ? process.env.CAPITAL_API_KEY_DEMO : process.env.CAPITAL_API_KEY_REAL;

  if (!apiKey) {
    throw new Error(`API Key ${isDemo ? "DEMO" : "REAL"} no encontrada en .env`);
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}
