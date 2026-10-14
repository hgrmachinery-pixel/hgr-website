import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDirectory = path.join(projectRoot, "src", "migrations");
const outputDirectory = path.join(projectRoot, "src", "migrations-compiled");
const migrations = readdirSync(migrationsDirectory)
  .filter((file) => file.endsWith(".ts") && file !== "index.ts")
  .map((file) => path.join(migrationsDirectory, file));

if (migrations.length === 0) {
  throw new Error(`No TypeScript migration files found in ${migrationsDirectory}`);
}

const tsc = path.join(projectRoot, "node_modules", "typescript", "bin", "tsc");
const result = spawnSync(
  process.execPath,
  [
    tsc,
    "--target", "ES2022",
    "--module", "NodeNext",
    "--moduleResolution", "NodeNext",
    "--strict",
    "--skipLibCheck",
    "--declaration", "false",
    "--sourceMap", "false",
    "--rootDir", migrationsDirectory,
    "--outDir", outputDirectory,
    ...migrations,
  ],
  { cwd: projectRoot, stdio: "inherit" },
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
