const cron = require('node-cron');
const { run: downloadGov } = require('./downloaders/gov-scraper');
const { exec } = require('child_process');
const logger = require('./utils/logger');

cron.schedule('0 4 * * *', async () => {
    logger.info("⏰ Daily job started (04:00)");

    await downloadGov();

    exec('npm start', (err, stdout, stderr) => {
        if (err) {
            logger.error("❌ Parser failed:", err);
        } else {
            logger.info("📦 Parser completed");
        }
    });
});

logger.info("🚀 Scheduler is running...");