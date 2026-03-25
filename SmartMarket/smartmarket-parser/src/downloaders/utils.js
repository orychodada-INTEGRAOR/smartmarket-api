// src/downloaders/utils.js

const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

// יצירת תיקייה אם לא קיימת
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.info(`📁 Created directory: ${dirPath}`);
  }
}

// השהייה
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// בדיקה אם קובץ קיים
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// בדיקת תקינות XML בסיסית
function validateXML(xmlContent, filePath) {
  const valid =
    xmlContent.includes("<Items>") ||
    xmlContent.includes("<Promotions>") ||
    xmlContent.includes("<Stores>") ||
    xmlContent.includes("<Branches>");

  if (!valid) {
    logger.warn(`⚠️ Invalid XML structure: ${filePath}`);
  }

  return valid;
}

// קריאה בטוחה של קובץ
function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    logger.error(`❌ Failed to read file: ${filePath} — ${err.message}`);
    return null;
  }
}

module.exports = {
  ensureDir,
  sleep,
  fileExists,
  validateXML,
  safeReadFile
};