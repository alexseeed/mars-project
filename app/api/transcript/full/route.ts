import { NextResponse } from 'next/server'
import axios from 'axios'

const FIREFLIES_API_KEY = process.env.FIREFLIES_API_KEY
const FIREFLIES_API_URL = 'https://api.fireflies.ai/graphql'

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

export async function GET(request: Request) {
  if (!FIREFLIES_API_KEY) {
    return NextResponse.json({ error: 'Fireflies API key not configured' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '1', 10)
    const skipCount = parseInt(searchParams.get('skipCount') || '0', 10)

    // Fetch transcripts in batches
    const response = await axios.post(
      FIREFLIES_API_URL,
      {
        query: `
          query GetTranscripts($limit: Int!) {
            transcripts(limit: $limit) {
              id
              title
              date
              sentences {
                speaker_name
                text
              }
            }
          }
        `,
        variables: {
          limit: count
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${FIREFLIES_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data.errors) {
      console.error('GraphQL Errors:', response.data.errors)
      const error = response.data.errors[0]
      
      // Handle rate limit errors
      if (error.extensions?.code === 'too_many_requests') {
        return NextResponse.json(
          { error: error.message },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    const transcripts = response.data.data.transcripts
    return NextResponse.json(transcripts)
  } catch (error: any) {
    console.error('Error fetching transcripts:', error)
    
    // Handle rate limit errors from axios
    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Handle other API errors
    if (error.response?.data?.errors) {
      return NextResponse.json(
        { error: error.response.data.errors[0].message },
        { status: error.response.status }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch transcripts' },
      { status: 500 }
    )
  }
} 