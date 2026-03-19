import type { Config } from 'drizzle-kit';
import fs from 'fs';

// Read DATABASE_URL from .env.local
const envFile = fs.readFileSync('.env.local', 'utf-8');
const lines = envFile.split('\n');
let databaseUrl = process.env.DATABASE_URL;

for (const line of lines) {
  if (line.startsWith('DATABASE_URL')) {
    // Extract the URL from DATABASE_URL="..."
    const match = line.match(/DATABASE_URL="([^"]*)"/);
    if (match) {
      databaseUrl = match[1];
    }
  }
}

export default {
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl!,
  },
} satisfies Config;
