import { NextRequest, NextResponse } from "next/server";

export interface JobStatus {
  status: "processing" | "done" | "error";
  progress: number;
  error?: string;
}

// In-memory job status store (survives within the same server process)
export const jobStatusMap = new Map<string, JobStatus>();

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing jobId parameter" },
      { status: 400 }
    );
  }

  const status = jobStatusMap.get(jobId);

  if (!status) {
    return NextResponse.json(
      { error: "Job not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(status);
}
