import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { db } from "@/lib/db";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/wav",
  "audio/m4a",
  "audio/x-m4a",
  "audio/mpeg",
  "video/mp4",
];

interface ParsedAnalysis {
  summary: string;
  keyTopics: string[];
  actionItems: string[];
  decisions: string[];
  followUpRequired: boolean;
  followUpDetails: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  leadQualification: {
    interestLevel: "High" | "Medium" | "Low" | "N/A";
    budgetDiscussed: boolean;
    timelineDiscussed: boolean;
  };
}

const DEFAULT_ANALYSIS: ParsedAnalysis = {
  summary: "Analysis unavailable",
  keyTopics: [],
  actionItems: [],
  decisions: [],
  followUpRequired: false,
  followUpDetails: "",
  sentiment: "Neutral",
  leadQualification: {
    interestLevel: "N/A",
    budgetDiscussed: false,
    timelineDiscussed: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const meetingId = formData.get("meetingId") as string | null;
    const callType = (formData.get("callType") as string | null) ?? "meeting";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 25MB." },
        { status: 413 }
      );
    }

    // Validate file type
    const fileType = file.type.toLowerCase();
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Accepted: audio/webm, audio/mp4, audio/wav, audio/m4a, video/mp4`,
        },
        { status: 415 }
      );
    }

    // Transcribe using Groq Whisper
    let transcriptText = "";
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioFile = new File([arrayBuffer], file.name || "recording.webm", {
        type: file.type,
      });

      const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-large-v3",
        response_format: "verbose_json",
        language: "en",
      });

      transcriptText = transcription.text || "";
    } catch (whisperErr) {
      console.error("Whisper transcription error:", whisperErr);
      return NextResponse.json(
        { error: "Transcription failed. Please try again." },
        { status: 500 }
      );
    }

    // Run AI analysis on the transcript
    let parsedAnalysis: ParsedAnalysis = { ...DEFAULT_ANALYSIS };

    if (transcriptText.trim().length > 0) {
      try {
        const analysisPrompt = `Analyze this meeting/call transcript and extract:
1. Key topics discussed (bullet points)
2. Action items with assignee (format: "- [Person]: Action item")
3. Decisions made
4. Follow-up required (Yes/No, what)
5. Meeting sentiment: Positive/Neutral/Negative
6. Lead qualification (if applicable): Interest level (High/Medium/Low), Budget discussed (Yes/No), Timeline mentioned
7. Summary (3-4 sentences)

Call Type: ${callType}

Transcript:
${transcriptText.slice(0, 4000)}

Respond in JSON format:
{
  "summary": "...",
  "keyTopics": ["topic1", "topic2"],
  "actionItems": ["[Person]: action"],
  "decisions": ["decision1"],
  "followUpRequired": true,
  "followUpDetails": "...",
  "sentiment": "Positive|Neutral|Negative",
  "leadQualification": {
    "interestLevel": "High|Medium|Low|N/A",
    "budgetDiscussed": true,
    "timelineDiscussed": false
  }
}`;

        const analysisResponse = await groq.chat.completions.create({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: analysisPrompt }],
          max_tokens: 800,
          temperature: 0.2,
        });

        const rawText =
          analysisResponse.choices[0]?.message?.content || "{}";
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          parsedAnalysis = {
            summary: parsed.summary || DEFAULT_ANALYSIS.summary,
            keyTopics: Array.isArray(parsed.keyTopics)
              ? parsed.keyTopics
              : [],
            actionItems: Array.isArray(parsed.actionItems)
              ? parsed.actionItems
              : [],
            decisions: Array.isArray(parsed.decisions)
              ? parsed.decisions
              : [],
            followUpRequired: Boolean(parsed.followUpRequired),
            followUpDetails: parsed.followUpDetails || "",
            sentiment:
              parsed.sentiment === "Positive" ||
              parsed.sentiment === "Negative"
                ? parsed.sentiment
                : "Neutral",
            leadQualification: {
              interestLevel:
                parsed.leadQualification?.interestLevel || "N/A",
              budgetDiscussed: Boolean(
                parsed.leadQualification?.budgetDiscussed
              ),
              timelineDiscussed: Boolean(
                parsed.leadQualification?.timelineDiscussed
              ),
            },
          };
        }
      } catch (analysisErr) {
        console.error("AI analysis error:", analysisErr);
        // Keep default analysis — fail gracefully
      }
    }

    // Save to DB if meetingId provided
    if (meetingId) {
      try {
        await db.meetingBooking.update({
          where: { id: meetingId },
          data: {
            notes: JSON.stringify({
              transcript: transcriptText,
              analysis: parsedAnalysis,
            }),
          },
        });
      } catch (dbErr) {
        console.error("DB save error:", dbErr);
        // Non-fatal — still return the result
      }
    }

    return NextResponse.json({
      transcript: transcriptText,
      analysis: parsedAnalysis,
    });
  } catch (err) {
    console.error("Transcribe route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
