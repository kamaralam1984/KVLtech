import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { businessType, city, count = 10 } = await request.json();

  const YT_KEY = process.env.YOUTUBE_API_KEY;
  if (!YT_KEY) return NextResponse.json({ leads: [], error: 'YouTube API key not set' });

  try {
    const query = `${businessType} ${city} India`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=${count}&key=${YT_KEY}&regionCode=IN`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) return NextResponse.json({ leads: [], error: data.error.message });

    const leads = (data.items || []).map((item: {
      snippet: { channelTitle: string; description: string; thumbnails?: { default?: { url: string } } };
      id: { channelId: string };
    }) => ({
      businessName: item.snippet.channelTitle,
      city: city,
      businessType: businessType,
      channelId: item.id.channelId,
      description: item.snippet.description?.slice(0, 100) || '',
      thumbnail: item.snippet.thumbnails?.default?.url || '',
      youtubeUrl: `https://youtube.com/channel/${item.id.channelId}`,
      email: '', // Would need to check channel's About page
      phone: '',
      rating: 'YT',
      status: 'youtube',
    }));

    return NextResponse.json({ leads, total: leads.length, source: 'youtube' });
  } catch (e) {
    console.error('YouTube API error:', e);
    return NextResponse.json({ leads: [], error: 'YouTube API failed' });
  }
}
