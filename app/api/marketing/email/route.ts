import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomeEmail,
  sendFollowUpEmail,
  sendColdOutreachEmail,
} from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, name, service, day, businessName, ownerName, businessType, city } = body;

    if (!to || !type) {
      return NextResponse.json({ error: '`to` and `type` are required' }, { status: 400 });
    }

    let success = false;

    if (type === 'welcome') {
      if (!name || !service) {
        return NextResponse.json({ error: '`name` and `service` required for welcome email' }, { status: 400 });
      }
      success = await sendWelcomeEmail(to, name, service);
    } else if (type === 'followup') {
      if (!name || !service) {
        return NextResponse.json({ error: '`name` and `service` required for follow-up email' }, { status: 400 });
      }
      success = await sendFollowUpEmail(to, name, service, day ?? 1);
    } else if (type === 'cold') {
      if (!businessName || !businessType || !city) {
        return NextResponse.json(
          { error: '`businessName`, `businessType`, and `city` required for cold outreach' },
          { status: 400 }
        );
      }
      success = await sendColdOutreachEmail(to, businessName, ownerName ?? '', businessType, city);
    } else {
      return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (err) {
    console.error('[/api/marketing/email] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
