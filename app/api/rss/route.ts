import { NextResponse } from 'next/server'
import axios from 'axios'

const FIREFLIES_API_KEY = process.env.FIREFLIES_API_KEY
const FIREFLIES_API_URL = 'https://api.fireflies.ai/graphql'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'

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

export async function GET() {
  if (!FIREFLIES_API_KEY) {
    return new NextResponse('Fireflies API key not configured', { status: 500 })
  }

  try {
    const getTranscriptsQuery = `
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

    const response = await axios.post(
      FIREFLIES_API_URL,
      { 
        query: getTranscriptsQuery,
        variables: {}
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FIREFLIES_API_KEY}`,
        },
      }
    )

    if (response.data.errors) {
      console.error('GraphQL Errors:', response.data.errors)
      return new NextResponse('Failed to fetch transcripts', { status: 500 })
    }

    const transcripts = response.data.data.transcripts as Transcript[]

    if (!transcripts || transcripts.length === 0) {
      return new NextResponse('No transcripts found', { status: 404 })
    }

    // Generate RSS feed
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Mars Project Transcripts</title>
    <link>${BASE_URL}</link>
    <description>Latest transcripts from Mars Project meetings</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/api/rss" rel="self" type="application/rss+xml" />
    ${transcripts.map(transcript => {
      // Get first few sentences as a brief summary
      const summary = transcript.sentences
        .slice(0, 3)
        .map(sentence => `${sentence.speaker_name}: ${sentence.text}`)
        .join(' | ')
      
      // Get full transcript text
      const fullText = transcript.sentences
        .map(sentence => `${sentence.speaker_name}: ${sentence.text}`)
        .join('\n\n')
      
      return `
    <item>
      <title>${transcript.title}</title>
      <link>${BASE_URL}/transcript/${transcript.id}</link>
      <guid>${BASE_URL}/transcript/${transcript.id}</guid>
      <pubDate>${new Date(transcript.date).toUTCString()}</pubDate>
      <description><![CDATA[${summary}... <a href="${BASE_URL}/transcript/${transcript.id}">Read full transcript</a>]]></description>
      <content:encoded><![CDATA[${fullText}]]></content:encoded>
      <author>Mars Project Team</author>
      <category>Meeting Transcript</category>
    </item>`
    }).join('')}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error: any) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse(
      error.response?.data?.errors?.[0]?.message || 'Failed to generate RSS feed', 
      { status: error.response?.status || 500 }
    )
  }
} 