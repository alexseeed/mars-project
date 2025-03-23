import { NextResponse } from 'next/server'
import axios from 'axios'

interface Sentence {
  speaker_name: string
  text: string
}

interface Transcript {
  id: string
  title: string
  date: number
  sentences: Sentence[]
}

const FIREFLIES_API_URL = 'https://api.fireflies.ai/graphql'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_FIREFLIES_API_KEY) {
      throw new Error('Fireflies API key not configured')
    }

    const response = await axios.post(
      FIREFLIES_API_URL,
      {
        query: `
          query GetTranscripts {
            transcripts(limit: 10) {
              id
              title
              date
              sentences {
                speaker_name
                text
              }
            }
          }
        `
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FIREFLIES_API_KEY}`
        }
      }
    )

    if (response.data.errors) {
      console.error('Fireflies API Error Response:', response.data)
      return NextResponse.json(
        { error: response.data.errors[0].message },
        { status: 500 }
      )
    }

    const transcripts = response.data.data.transcripts as Transcript[]

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Fireflies Transcripts</title>
    <link>https://app.agentur-consulting.de</link>
    <description>Latest transcripts from Fireflies.ai</description>
    ${transcripts.map((transcript: Transcript) => `
      <item>
        <title>${transcript.title}</title>
        <link>https://app.agentur-consulting.de/transcript/${transcript.id}</link>
        <description>${transcript.sentences.slice(0, 5).map((s: Sentence) => s.text).join(' ')}</description>
        <pubDate>${new Date(transcript.date).toUTCString()}</pubDate>
        <guid>https://app.agentur-consulting.de/transcript/${transcript.id}</guid>
      </item>
    `).join('')}
  </channel>
</rss>`

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return NextResponse.json(
      { error: 'Failed to generate RSS feed' },
      { status: 500 }
    )
  }
} 