'use client';

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

export default function TranscriptPage({ params }: { params: { id: string } }) {
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/transcript/full?count=1&id=${params.id}`)
        if (response.data?.data?.transcript) {
          setTranscript(response.data.data.transcript)
        }
      } catch (error) {
        console.error('Error fetching transcript:', error)
        setError('Failed to load transcript')
      } finally {
        setLoading(false)
      }
    }

    if (params?.id) {
      fetchTranscript()
    }
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-red-600 mb-4">{error}</div>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!transcript) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 mb-4">Transcript not found</div>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Group consecutive sentences by speaker
  const groupedSentences = transcript.sentences.reduce((acc: { speaker: string; texts: string[] }[], sentence, index) => {
    if (index === 0 || sentence.speaker_name !== transcript.sentences[index - 1].speaker_name) {
      // New speaker or first sentence
      acc.push({
        speaker: sentence.speaker_name,
        texts: [sentence.text]
      })
    } else {
      // Same speaker as previous sentence
      acc[acc.length - 1].texts.push(sentence.text)
    }
    return acc
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
            >
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{transcript.title}</h1>
            <p className="text-gray-600">
              {new Date(transcript.date).toLocaleDateString()}
            </p>
          </div>
          
          <div className="prose max-w-none">
            {groupedSentences.map((group, index) => (
              <div key={index} className="mb-6">
                <div className="font-semibold text-gray-700 mb-2">{group.speaker}:</div>
                <div className="text-gray-800 pl-4">
                  {group.texts.join(' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 