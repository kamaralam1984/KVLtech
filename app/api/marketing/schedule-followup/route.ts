import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendFollowUpEmail } from '@/lib/email-service';

// Follow-up schedule: Day 1, 3, 7 after the initial contact
const FOLLOWUP_DAYS = [1, 3, 7];

// POST /api/marketing/schedule-followup
// Body: { leadId, email, name, service }
// Creates scheduled follow-up records in the DB (stored as contact_lead notes)
// and optionally triggers immediate Day-N send when called with { day }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, email, name, service, day } = body as {
      leadId?: string;
      email: string;
      name: string;
      service: string;
      day?: number; // if provided, send that specific day's follow-up immediately
    };

    if (!email || !name || !service) {
      return NextResponse.json(
        { error: '`email`, `name`, and `service` are required' },
        { status: 400 }
      );
    }

    // If a specific day is requested, send immediately
    if (day !== undefined) {
      if (!FOLLOWUP_DAYS.includes(day)) {
        return NextResponse.json(
          { error: `day must be one of ${FOLLOWUP_DAYS.join(', ')}` },
          { status: 400 }
        );
      }

      const success = await sendFollowUpEmail(email, name, service, day);
      return NextResponse.json({ success, day, email });
    }

    // Otherwise, record follow-up schedule on the lead and queue Day 1 immediately
    if (leadId) {
      const now = new Date();
      const scheduleNote = FOLLOWUP_DAYS.map((d) => {
        const sendAt = new Date(now);
        sendAt.setDate(sendAt.getDate() + d);
        return `Day ${d}: ${sendAt.toISOString()}`;
      }).join(' | ');

      await db.contactLead.update({
        where: { id: leadId },
        data: {
          notes: `[FOLLOWUP_SCHEDULE] ${scheduleNote}`,
          // Set followUpAt to Day 1
          followUpAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          status: 'CONTACTED',
        },
      });
    }

    // Trigger Day 1 follow-up immediately (non-blocking)
    sendFollowUpEmail(email, name, service, 1).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Follow-up sequence scheduled. Day 1 email dispatched.',
      schedule: FOLLOWUP_DAYS.map((d) => ({
        day: d,
        sendAt: new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString(),
      })),
    });
  } catch (err) {
    console.error('[/api/marketing/schedule-followup] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET /api/marketing/schedule-followup?leadId=xxx
// Returns the follow-up schedule stored on a lead
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: '`leadId` query param required' }, { status: 400 });
    }

    const lead = await db.contactLead.findUnique({
      where: { id: leadId },
      select: { id: true, name: true, email: true, service: true, notes: true, followUpAt: true, status: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (err) {
    console.error('[/api/marketing/schedule-followup GET] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
