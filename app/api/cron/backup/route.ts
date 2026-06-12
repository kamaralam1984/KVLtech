import { NextRequest, NextResponse } from "next/server";
import {
  readSchedule,
  readManifest,
  createBackup,
  applyRetention,
  generateId,
  generateFilename,
} from "@/lib/backup";

const BACKUP_DIR = "/opt/kvl-app/backups";

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil((diff / oneWeek) + start.getDay() / 7);
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function GET(req: NextRequest) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = readSchedule();
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDate();
    const currentDayOfWeek = now.getDay();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const ran: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    const manifest = readManifest();

    if (config.daily?.enabled && currentHour === config.daily.hour) {
      try {
        const todayStr = now.toISOString().slice(0, 10);
        const alreadyRan = manifest.some(
          (e) => e.schedule === "DAILY" && new Date(e.createdAt).toISOString().slice(0, 10) === todayStr
        );

        if (!alreadyRan) {
          const id = generateId();
          const filename = generateFilename("DAILY");
          const filePath = `${BACKUP_DIR}/${filename}`;
          const name = `Daily Backup — ${todayStr}`;
          await createBackup({ id, name, filename, filePath, schedule: "DAILY", createdBy: "system-cron", notes: "" });
          applyRetention("DAILY", config.daily.retentionCount);
          ran.push("DAILY");
        } else {
          skipped.push("DAILY");
        }
      } catch (err) {
        console.error("[cron/backup] DAILY error", err);
        errors.push("DAILY");
      }
    } else {
      skipped.push("DAILY");
    }

    if (config.weekly?.enabled && currentDayOfWeek === config.weekly.dayOfWeek && currentHour === config.weekly.hour) {
      try {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const alreadyRan = manifest.some(
          (e) => e.schedule === "WEEKLY" && new Date(e.createdAt) >= sevenDaysAgo
        );

        if (!alreadyRan) {
          const id = generateId();
          const filename = generateFilename("WEEKLY");
          const filePath = `${BACKUP_DIR}/${filename}`;
          const weekNum = getWeekNumber(now);
          const name = `Weekly Backup — Week ${weekNum} ${currentYear}`;
          await createBackup({ id, name, filename, filePath, schedule: "WEEKLY", createdBy: "system-cron", notes: "" });
          applyRetention("WEEKLY", config.weekly.retentionCount);
          ran.push("WEEKLY");
        } else {
          skipped.push("WEEKLY");
        }
      } catch (err) {
        console.error("[cron/backup] WEEKLY error", err);
        errors.push("WEEKLY");
      }
    } else {
      skipped.push("WEEKLY");
    }

    if (config.monthly?.enabled && currentDay === config.monthly.dayOfMonth && currentHour === config.monthly.hour) {
      try {
        const alreadyRan = manifest.some((e) => {
          const d = new Date(e.createdAt);
          return e.schedule === "MONTHLY" && d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
        });

        if (!alreadyRan) {
          const id = generateId();
          const filename = generateFilename("MONTHLY");
          const filePath = `${BACKUP_DIR}/${filename}`;
          const name = `Monthly Backup — ${MONTH_NAMES[currentMonth - 1]} ${currentYear}`;
          await createBackup({ id, name, filename, filePath, schedule: "MONTHLY", createdBy: "system-cron", notes: "" });
          applyRetention("MONTHLY", config.monthly.retentionCount);
          ran.push("MONTHLY");
        } else {
          skipped.push("MONTHLY");
        }
      } catch (err) {
        console.error("[cron/backup] MONTHLY error", err);
        errors.push("MONTHLY");
      }
    } else {
      skipped.push("MONTHLY");
    }

    if (
      config.yearly?.enabled &&
      currentMonth === config.yearly.month &&
      currentDay === config.yearly.day &&
      currentHour === config.yearly.hour
    ) {
      try {
        const alreadyRan = manifest.some(
          (e) => e.schedule === "YEARLY" && new Date(e.createdAt).getFullYear() === currentYear
        );

        if (!alreadyRan) {
          const id = generateId();
          const filename = generateFilename("YEARLY");
          const filePath = `${BACKUP_DIR}/${filename}`;
          const name = `Yearly Backup — ${currentYear}`;
          await createBackup({ id, name, filename, filePath, schedule: "YEARLY", createdBy: "system-cron", notes: "" });
          applyRetention("YEARLY", config.yearly.retentionCount);
          ran.push("YEARLY");
        } else {
          skipped.push("YEARLY");
        }
      } catch (err) {
        console.error("[cron/backup] YEARLY error", err);
        errors.push("YEARLY");
      }
    } else {
      skipped.push("YEARLY");
    }

    return NextResponse.json({ success: true, ran, skipped, errors });
  } catch (err) {
    console.error("[cron/backup]", err);
    return NextResponse.json({ error: "Cron backup failed" }, { status: 500 });
  }
}
