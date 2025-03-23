'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

export default function Home() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [skipCount, setSkipCount] = useState(0)

  useEffect(() => {
    fetchTranscripts()
  }, [])

  const fetchTranscripts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/transcript/full?count=5')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transcripts')
      }

      // If we already have transcripts, only add new ones
      if (transcripts.length > 0) {
        const newTranscripts = Array.isArray(data) 
          ? data.filter(t => !transcripts.some(existing => existing.id === t.id))
          : [data].filter(t => !transcripts.some(existing => existing.id === t.id))
        
        if (newTranscripts.length > 0) {
          setTranscripts(prev => [...newTranscripts, ...prev])
        }
      } else {
        setTranscripts(Array.isArray(data) ? data : [data])
      }
    } catch (err) {
      console.error('Error fetching transcripts:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to fetch transcripts')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddTranscript = async () => {
    if (isAdding) return
    setIsAdding(true)
    setError(null)

    try {
      // Fetch 5 transcripts at once to reduce API calls
      const response = await fetch(`/api/transcript/full?count=5&skipCount=${skipCount}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError('Rate limit reached. Please wait a moment before trying again.')
          return
        }
        throw new Error(data.error || 'Failed to fetch transcript')
      }

      // Find the first transcript that's not already in our list
      const newTranscript = data.find((t: Transcript) => 
        !transcripts.some(existing => existing.id === t.id)
      )

      if (newTranscript) {
        setTranscripts(prev => [newTranscript, ...prev])
        setSkipCount(0) // Reset skip count on success
      } else {
        // If no new transcript found, try fetching older ones
        setSkipCount(prev => prev + 5)
        setError('No new transcripts found. Trying older ones...')
        // Add a delay before trying again
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (err) {
      console.error('Error adding transcript:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to add transcript')
      }
    } finally {
      setIsAdding(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transcripts</h1>
          <div className="flex gap-4">
            <button
              onClick={handleAddTranscript}
              disabled={isAdding}
              className={`px-4 py-2 rounded-lg text-white font-medium ${
                isAdding 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isAdding ? 'Adding...' : 'Add New Transcript'}
            </button>
            <a
              href="/api/rss"
              className="px-4 py-2 rounded-lg text-white font-medium bg-orange-500 hover:bg-orange-600"
            >
              RSS Feed
            </a>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {transcripts.map((transcript) => (
            <Link
              key={transcript.id}
              href={`/transcript/${transcript.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {transcript.title}
                </h2>
                <p className="text-gray-600">
                  {new Date(transcript.date).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 