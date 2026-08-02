export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConfigError';
  }
}

export function requireDatabaseUrl(
  value: string | undefined = process.env.DATABASE_URL
): string {
  const databaseUrl = value?.trim();
  if (!databaseUrl) {
    throw new DatabaseConfigError(
      'DATABASE_URL is required before using the database.'
    );
  }
  return databaseUrl;
}
