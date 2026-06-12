import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export type BackupSchedule = "MANUAL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type BackupStatus = "RUNNING" | "COMPLETED" | "FAILED" | "DELETED";

export interface BackupEntry {
  id: string;
  name: string;
  filename: string;
  filePath: string;
  schedule: BackupSchedule;
  status: BackupStatus;
  sizeBytes: number;
  createdBy: string;
  notes: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ScheduleConfig {
  daily:   { enabled: boolean; hour: number; retentionCount: number };
  weekly:  { enabled: boolean; dayOfWeek: number; hour: number; retentionCount: number };
  monthly: { enabled: boolean; dayOfMonth: number; hour: number; retentionCount: number };
  yearly:  { enabled: boolean; month: number; day: number; hour: number; retentionCount: number };
}

export const BACKUP_DIR = "/opt/kvl-app/backups";
export const MANIFEST_PATH = `${BACKUP_DIR}/manifest.json`;
export const SCHEDULE_PATH = `${BACKUP_DIR}/schedule.json`;

const DEFAULT_SCHEDULE: ScheduleConfig = {
  daily:   { enabled: false, hour: 2, retentionCount: 7 },
  weekly:  { enabled: false, dayOfWeek: 0, hour: 3, retentionCount: 4 },
  monthly: { enabled: false, dayOfMonth: 1, hour: 4, retentionCount: 12 },
  yearly:  { enabled: false, month: 1, day: 1, hour: 5, retentionCount: 3 },
};

export function ensureBackupDir(): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

export function readManifest(): BackupEntry[] {
  ensureBackupDir();
  if (!fs.existsSync(MANIFEST_PATH)) return [];
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
    return JSON.parse(raw) as BackupEntry[];
  } catch {
    return [];
  }
}

export function writeManifest(entries: BackupEntry[]): void {
  ensureBackupDir();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2), "utf-8");
}

export function readSchedule(): ScheduleConfig {
  ensureBackupDir();
  if (!fs.existsSync(SCHEDULE_PATH)) return { ...DEFAULT_SCHEDULE };
  try {
    const raw = fs.readFileSync(SCHEDULE_PATH, "utf-8");
    return JSON.parse(raw) as ScheduleConfig;
  } catch {
    return { ...DEFAULT_SCHEDULE };
  }
}

export function writeSchedule(config: ScheduleConfig): void {
  ensureBackupDir();
  fs.writeFileSync(SCHEDULE_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function generateFilename(schedule: BackupSchedule): string {
  const ts = new Date().toISOString().replace(/:/g, "-").replace(/\..+$/, "");
  return `backup-${schedule}-${ts}.sql.gz`;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(2)} KB`;
}

export async function createBackup(
  entry: Omit<BackupEntry, "sizeBytes" | "status" | "completedAt" | "error">
): Promise<BackupEntry> {
  const entries = readManifest();
  const running: BackupEntry = { ...entry, sizeBytes: 0, status: "RUNNING" };
  entries.push(running);
  writeManifest(entries);

  const filePath = entry.filePath;
  let final: BackupEntry;

  try {
    await execAsync(`pg_dump "${process.env.DATABASE_URL}" | gzip > "${filePath}"`);
    const stat = fs.statSync(filePath);
    final = {
      ...running,
      status: "COMPLETED",
      sizeBytes: stat.size,
      completedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    final = { ...running, status: "FAILED", error: message };
  }

  const updated = readManifest().map((e) => (e.id === final.id ? final : e));
  writeManifest(updated);
  return final;
}

export async function restoreBackup(id: string): Promise<void> {
  const entries = readManifest();
  const entry = entries.find((e) => e.id === id);
  if (!entry) throw new Error(`Backup not found: ${id}`);
  if (!fs.existsSync(entry.filePath)) throw new Error(`Backup file not found: ${entry.filePath}`);
  await execAsync(`gunzip -c "${entry.filePath}" | psql "${process.env.DATABASE_URL}"`);
}

export function deleteBackupEntry(id: string): boolean {
  const entries = readManifest();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return false;

  const entry = entries[idx];
  try {
    if (fs.existsSync(entry.filePath)) fs.unlinkSync(entry.filePath);
  } catch {
    // ignore missing file
  }

  entries[idx] = { ...entry, status: "DELETED" };
  writeManifest(entries);
  return true;
}

export function applyRetention(schedule: BackupSchedule, count: number): void {
  const entries = readManifest();
  const completed = entries
    .filter((e) => e.schedule === schedule && e.status === "COMPLETED")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const toDelete = completed.slice(count);
  for (const entry of toDelete) {
    deleteBackupEntry(entry.id);
  }
}
