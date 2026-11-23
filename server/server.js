const mongoose = require('mongoose');
const { validateEnv } = require('./config/env');
const { createApp } = require('./app');

async function start() {
  const config = validateEnv();
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB.');

  const app = createApp(config);
  const server = app.listen(config.port, () => {
    console.log(`UrbanPulse API listening on http://localhost:${config.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Closing UrbanPulse API...`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error(`Unable to start UrbanPulse API: ${error.message}`);
  process.exit(1);
});
