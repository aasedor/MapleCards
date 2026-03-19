/** Validates that required environment variables are set for server-side features. */
export function validateEnv() {
  const warnings: string[] = [];

  if (!process.env.MAGIC_HOUR_API_KEY) {
    warnings.push('MAGIC_HOUR_API_KEY is not set — Starring You face swap will be disabled');
  }

  if (!process.env.RESEND_API_KEY) {
    warnings.push('RESEND_API_KEY is not set — email sending will be disabled');
  }

  if (!process.env.DATABASE_URL) {
    warnings.push('DATABASE_URL is not set — database features will be disabled');
  }

  for (const w of warnings) {
    console.warn(`[env] ${w}`);
  }

  return {
    hasMagicHour: !!process.env.MAGIC_HOUR_API_KEY,
    hasResend: !!process.env.RESEND_API_KEY,
    hasDatabase: !!process.env.DATABASE_URL,
  };
}
