'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

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

export default function TranscriptPage() {
  const params = useParams()
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTranscript = async () => {
      if (!params?.id) return

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/transcript/full?id=${params.id}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch transcript')
        }

        if (data.errors) {
          throw new Error(data.errors[0].message || 'Failed to fetch transcript')
        }

        setTranscript(data.data.transcript)
      } catch (error: any) {
        console.error('Error fetching transcript:', error)
        setError(error.message || 'Failed to fetch transcript')
      } finally {
        setLoading(false)
      }
    }

    fetchTranscript()
  }, [params?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!transcript) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-center">
          <h1 className="text-2xl font-bold mb-4">Transcript Not Found</h1>
          <p>The requested transcript could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{transcript.title}</h1>
      <div className="space-y-4">
        {transcript.sentences.map((sentence, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <p className="font-semibold text-gray-700">{sentence.speaker_name}</p>
            <p className="text-gray-600">{sentence.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 