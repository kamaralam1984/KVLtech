import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { city, businessType, count = 10 } = await request.json();

  if (!city || !businessType) {
    return NextResponse.json({ error: 'city and businessType required' }, { status: 400 });
  }

  const SERPAPI_KEY = process.env.SERPAPI_KEY;

  let leads: Array<{
    businessName: string;
    ownerName?: string;
    city: string;
    businessType: string;
    address?: string;
    email: string;
    phone: string;
    rating: string | number;
    website?: string;
    maps_url?: string;
    status: string;
  }> = [];

  // Try SerpAPI Google Maps search (real business data)
  if (SERPAPI_KEY && !SERPAPI_KEY.includes('placeholder')) {
    try {
      const query = `${businessType} in ${city}`;
      const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&hl=en&gl=in`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.local_results && data.local_results.length > 0) {
        leads = data.local_results.slice(0, count).map((place: {
          title: string;
          address?: string;
          phone?: string;
          website?: string;
          rating?: number;
          gps_coordinates?: { latitude: number; longitude: number };
        }) => {
          const domain = place.website ? new URL(place.website).hostname.replace('www.', '') : '';
          return {
            businessName: place.title,
            city: city as string,
            businessType: businessType as string,
            address: place.address || '',
            phone: place.phone || '',
            website: place.website || '',
            email: domain ? `info@${domain}` : `contact@${place.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            rating: place.rating || '4.5',
            maps_url: place.gps_coordinates ? `https://maps.google.com/?q=${place.gps_coordinates.latitude},${place.gps_coordinates.longitude}` : '',
            status: 'found',
          };
        });
      } else if (data.error) {
        console.error('SerpAPI error:', data.error);
      }
    } catch (e) {
      console.error('SerpAPI fetch error:', e);
    }
  }

  // Fallback: realistic demo data
  if (leads.length === 0) {
    const surnames = ['Sharma', 'Patel', 'Gupta', 'Verma', 'Singh', 'Kumar', 'Mehta', 'Agarwal', 'Joshi', 'Reddy'];
    const firstNames = ['Rajesh', 'Amit', 'Sunil', 'Vikas', 'Deepak', 'Anil', 'Mahesh', 'Ravi', 'Sanjay', 'Prakash'];
    leads = surnames.slice(0, count as number).map((sur, i) => ({
      businessName: `${sur} ${businessType}`,
      ownerName: `${firstNames[i]} ${sur}`,
      city: city as string,
      businessType: businessType as string,
      email: `info@${sur.toLowerCase()}${(businessType as string).toLowerCase().replace(/ /g, '')}.com`,
      phone: `+91 98${Math.floor(Math.random() * 100000000).toString().padStart(8,'0')}`,
      rating: (4 + Math.random()).toFixed(1),
      status: 'demo',
    }));
  }

  return NextResponse.json({ leads, total: leads.length, source: leads[0]?.status === 'demo' ? 'demo' : 'google_maps' });
}
