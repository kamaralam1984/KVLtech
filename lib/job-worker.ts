/**
 * Job Worker
 * Processes jobs dequeued from lib/job-queue.ts.
 * Import processJob / runWorkerBatch wherever you need to consume the queue.
 */

import { dequeueJob, completeJob, failJob, type Job } from "./job-queue"
import { sendEmailWithFallback } from "./email"
import { sendWhatsAppMessage, sendTelegramMessage } from "./integrations"
import { runAutomationTrigger } from "./automation-engine"
import { runAlertChecks } from "./alert-engine"

export async function processJob(job: Job): Promise<void> {
  console.log(`[Worker] Processing ${job.type} job ${job.id}`)

  switch (job.type) {
    case "send_email": {
      const { to, subject, html, text } = job.payload as {
        to: string
        subject: string
        html?: string
        text?: string
      }
      await sendEmailWithFallback(to, subject, html ?? text ?? "")
      break
    }

    case "send_whatsapp": {
      const { to, message } = job.payload as { to: string; message: string }
      const ok = await sendWhatsAppMessage(to, message)
      if (!ok) throw new Error("WhatsApp send failed")
      break
    }

    case "send_telegram": {
      const { message } = job.payload as { message: string }
      await sendTelegramMessage(message)
      break
    }

    case "automation_trigger": {
      const { trigger, context } = job.payload as {
        trigger: string
        context: Record<string, unknown>
      }
      await runAutomationTrigger(trigger, context)
      break
    }

    case "alert_check": {
      await runAlertChecks()
      break
    }

    case "report_generate": {
      // Placeholder: generate and store report
      console.log("[Worker] Report generation requested:", job.payload)
      break
    }

    case "webhook_retry": {
      // Placeholder: retry webhook delivery
      console.log("[Worker] Webhook retry requested:", job.payload)
      break
    }

    case "lead_score": {
      // Placeholder: async lead scoring
      console.log("[Worker] Lead score requested:", job.payload)
      break
    }

    default: {
      const exhaustive: never = job.type
      console.warn(`[Worker] Unknown job type: ${exhaustive}`)
    }
  }
}

/**
 * Dequeue and process up to `maxJobs` jobs in one batch.
 * Returns counts of successful and failed jobs.
 */
export async function runWorkerBatch(
  maxJobs = 10
): Promise<{ processed: number; failed: number }> {
  let processed = 0
  let failed = 0

  for (let i = 0; i < maxJobs; i++) {
    const job = await dequeueJob()
    if (!job) break

    try {
      await processJob(job)
      await completeJob(job.id)
      processed++
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      await failJob(job, errorMsg)
      failed++
    }
  }

  if (processed > 0 || failed > 0) {
    console.log(`[Worker] Batch done — processed=${processed} failed=${failed}`)
  }

  return { processed, failed }
}
