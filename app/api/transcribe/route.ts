import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 });
    }

    const audioBuffer = await audioFile.arrayBuffer();

    // Try Deepgram (primary, free tier)
    const deepgramKey = process.env.DEEPGRAM_API_KEY;
    if (deepgramKey && !deepgramKey.includes('placeholder')) {
      try {
        const res = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=hi-en&punctuate=true&smart_format=true', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${deepgramKey}`,
            'Content-Type': audioFile.type || 'audio/webm',
          },
          body: audioBuffer,
        });

        if (res.ok) {
          const data = await res.json();
          const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
          return NextResponse.json({ transcript, provider: 'deepgram' });
        }
      } catch (e) {
        console.error('Deepgram error:', e);
      }
    }

    // Try AssemblyAI (fallback)
    const assemblyKey = process.env.ASSEMBLYAI_API_KEY;
    if (assemblyKey && !assemblyKey.includes('placeholder')) {
      try {
        // Upload audio
        const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
          method: 'POST',
          headers: { 'authorization': assemblyKey, 'content-type': 'application/octet-stream' },
          body: audioBuffer,
        });
        const { upload_url } = await uploadRes.json();

        // Request transcription
        const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
          method: 'POST',
          headers: { 'authorization': assemblyKey, 'content-type': 'application/json' },
          body: JSON.stringify({ audio_url: upload_url, language_code: 'hi' }),
        });
        const { id } = await transcriptRes.json();

        // Poll for result (max 10s for chat use case)
        for (let i = 0; i < 10; i++) {
          await new Promise(r => setTimeout(r, 1000));
          const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
            headers: { 'authorization': assemblyKey },
          });
          const result = await pollRes.json();
          if (result.status === 'completed') {
            return NextResponse.json({ transcript: result.text || '', provider: 'assemblyai' });
          }
          if (result.status === 'error') break;
        }
      } catch (e) {
        console.error('AssemblyAI error:', e);
      }
    }

    return NextResponse.json({ transcript: '', error: 'Transcription failed' }, { status: 500 });
  } catch (e) {
    console.error('Transcribe route error:', e);
    return NextResponse.json({ transcript: '', error: 'Server error' }, { status: 500 });
  }
}
