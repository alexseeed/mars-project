import { NextResponse } from 'next/server'
import axios from 'axios'

const FIREFLIES_API_KEY = process.env.FIREFLIES_API_KEY
const FIREFLIES_API_URL = 'https://api.fireflies.ai/graphql'

export async function GET() {
  if (!FIREFLIES_API_KEY) {
    console.error('Fireflies API key is not configured')
    return NextResponse.json(
      { error: 'Fireflies API key not configured' },
      { status: 500 }
    )
  }

  try {
    console.log('Making request to Fireflies API with key:', FIREFLIES_API_KEY.substring(0, 8) + '...')
    
    // First, get the latest transcript ID
    const getLatestTranscriptQuery = `
      query GetLatestTranscript {
        transcripts(limit: 1) {
          id
          title
          date
        }
      }
    `

    const latestTranscriptResponse = await axios.post(
      FIREFLIES_API_URL,
      { 
        query: getLatestTranscriptQuery,
        variables: {}
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FIREFLIES_API_KEY}`,
        },
      }
    )

    console.log('Fireflies API Response:', JSON.stringify(latestTranscriptResponse.data, null, 2))

    if (latestTranscriptResponse.data.errors) {
      console.error('GraphQL Errors:', latestTranscriptResponse.data.errors)
      return NextResponse.json(
        { error: 'GraphQL Error: ' + latestTranscriptResponse.data.errors[0].message },
        { status: 400 }
      )
    }

    const latestTranscript = latestTranscriptResponse.data.data.transcripts[0]
    if (!latestTranscript) {
      return NextResponse.json(
        { error: 'No transcripts found' },
        { status: 404 }
      )
    }

    // Then, get the summary for this transcript
    const getSummaryQuery = `
      query GetTranscriptSummary($transcriptId: String!) {
        transcript(id: $transcriptId) {
          summary {
            keywords
            action_items
            outline
            shorthand_bullet
            overview
            bullet_gist
            gist
            short_summary
          }
        }
      }
    `

    const summaryResponse = await axios.post(
      FIREFLIES_API_URL,
      {
        query: getSummaryQuery,
        variables: { transcriptId: latestTranscript.id }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FIREFLIES_API_KEY}`,
        },
      }
    )

    console.log('Summary Response:', JSON.stringify(summaryResponse.data, null, 2))

    if (summaryResponse.data.errors) {
      console.error('GraphQL Errors:', summaryResponse.data.errors)
      return NextResponse.json(
        { error: 'GraphQL Error: ' + summaryResponse.data.errors[0].message },
        { status: 400 }
      )
    }

    const summary = summaryResponse.data.data.transcript.summary

    return NextResponse.json({
      id: latestTranscript.id,
      title: latestTranscript.title,
      created_at: latestTranscript.date,
      summary: {
        keywords: summary.keywords,
        actionItems: summary.action_items,
        outline: summary.outline,
        shorthandBullet: summary.shorthand_bullet,
        overview: summary.overview,
        bulletGist: summary.bullet_gist,
        gist: summary.gist,
        shortSummary: summary.short_summary
      }
    })
  } catch (error: any) {
    console.error('Error fetching transcript:', error)
    if (error.response?.data?.errors) {
      console.error('Fireflies API Error Response:', JSON.stringify(error.response.data, null, 2))
      return NextResponse.json(
        { error: 'Fireflies API Error: ' + error.response.data.errors[0].message },
        { status: error.response.status }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch transcript: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
} 