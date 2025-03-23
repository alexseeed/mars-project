'use client';

import { useEffect, useState } from 'react'
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

interface Props {
  id: string
}

export default function TranscriptContent({ id }: Props) {
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await axios.post(
          'https://api.fireflies.ai/graphql',
          {
            query: `
              query GetTranscript($id: ID!) {
                transcript(id: $id) {
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
              id
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FIREFLIES_API_KEY}`
            }
          }
        )

        if (response.data.errors) {
          setError(response.data.errors[0].message)
        } else {
          setTranscript(response.data.data.transcript)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTranscript()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 p-6 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!transcript) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Transcript not found</p>
        </div>
      </div>
    )
  }

  // Group sentences by speaker
  const groupedSentences: { speaker: string; sentences: string[] }[] = []
  let currentGroup: { speaker: string; sentences: string[] } | null = null

  transcript.sentences.forEach((sentence) => {
    if (!currentGroup || currentGroup.speaker !== sentence.speaker_name) {
      currentGroup = {
        speaker: sentence.speaker_name,
        sentences: [sentence.text]
      }
      groupedSentences.push(currentGroup)
    } else {
      currentGroup.sentences.push(sentence.text)
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{transcript.title}</h1>
      <div className="space-y-6">
        {groupedSentences.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {group.speaker}
            </h3>
            <div className="space-y-2">
              {group.sentences.map((text, sentenceIndex) => (
                <p key={sentenceIndex} className="text-gray-600">
                  {text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 