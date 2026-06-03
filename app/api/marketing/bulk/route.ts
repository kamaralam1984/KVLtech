import { NextRequest, NextResponse } from 'next/server';
import { sendBulkEmail, BulkEmailRecipient } from '@/lib/email-service';

// POST /api/marketing/bulk
// Body: { type: 'welcome' | 'followup' | 'cold', day?: number, recipients: BulkEmailRecipient[] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, day, recipients } = body as {
      type: 'welcome' | 'followup' | 'cold';
      day?: number;
      recipients: BulkEmailRecipient[];
    };

    if (!type || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: '`type` and non-empty `recipients` array are required' },
        { status: 400 }
      );
    }

    if (!['welcome', 'followup', 'cold'].includes(type)) {
      return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }

    // Run bulk send (throttled inside sendBulkEmail)
    const results = await sendBulkEmail(recipients, type, day);

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('[/api/marketing/bulk] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
