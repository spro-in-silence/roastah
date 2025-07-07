import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEW_DATABASE_URL!,
  },
});