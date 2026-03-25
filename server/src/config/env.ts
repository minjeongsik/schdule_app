import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function normalizeDatabaseUrl(value: string) {
  if (!value.startsWith("file:./")) {
    return value;
  }

  const serverRoot = fileURLToPath(new URL("../../", import.meta.url));
  const relativePath = value.slice("file:./".length);
  const absolutePath = path.resolve(serverRoot, relativePath);

  return `file:${absolutePath.replace(/\\/g, "/")}`;
}

const databaseUrl = normalizeDatabaseUrl(requireEnv("DATABASE_URL"));
process.env.DATABASE_URL = databaseUrl;

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl
};
