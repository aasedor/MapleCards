const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Load DATABASE_URL from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]*)"/);
const databaseUrl = dbUrlMatch ? dbUrlMatch[1] : undefined;

if (!databaseUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

// Set environment variable
process.env.DATABASE_URL = databaseUrl;

// Run drizzle-kit push
const drizzle = spawn('npx', ['drizzle-kit', 'push'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, DATABASE_URL: databaseUrl }
});

drizzle.on('exit', (code) => {
  process.exit(code);
});
