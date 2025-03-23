import { NextResponse } from 'next/server'
import axios from 'axios'

const FIREFLIES_API_URL = 'https://api.fireflies.ai/graphql'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!process.env.NEXT_PUBLIC_FIREFLIES_API_KEY) {
      console.error('Fireflies API key not configured')
      return NextResponse.json(
        { error: 'Fireflies API key not configured' },
        { status: 500 }
      )
    }

    const query = id 
      ? `query Transcript($id: String!) {
          transcript(id: $id) {
            id
            title
            date
            sentences {
              speaker_name
              text
            }
          }
        }`
      : `query Transcripts {
          transcripts {
            id
            title
            date
            sentences {
              speaker_name
              text
            }
          }
        }`

    const variables = id ? { id } : {}

    console.log('Making request to Fireflies API with key:', process.env.NEXT_PUBLIC_FIREFLIES_API_KEY.substring(0, 8) + '...')

    const response = await axios.post(
      FIREFLIES_API_URL,
      {
        query,
        variables
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

    // Sort transcripts by date in descending order (newest first)
    let data = response.data
    if (!id) {
      const allTranscripts = data.data.transcripts || []
      const sortedTranscripts = allTranscripts.sort((a: any, b: any) => b.date - a.date)
      data.data.transcripts = sortedTranscripts
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching transcripts:', error)
    if (error.response) {
      console.error('Error response:', error.response.data)
      return NextResponse.json(
        { error: error.response.data.errors?.[0]?.message || 'Failed to fetch transcripts' },
        { status: error.response.status }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch transcripts' },
      { status: 500 }
    )
  }
} 