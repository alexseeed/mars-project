'use client'

import { useEffect, useState } from 'react'

interface FullTranscript {
  id: string
  title: string
  date: number
  transcript: string
}

export default function FullTranscript() {
  const [transcript, setTranscript] = useState<FullTranscript | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/transcript/full')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch transcript')
        }

        setTranscript(data)
      } catch (error: any) {
        console.error('Error:', error)
        setError(error.message || 'Failed to fetch transcript')
      } finally {
        setLoading(false)
      }
    }

    fetchTranscript()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!transcript) {
    return (
      <div className="text-gray-500 text-center py-8">
        No transcript found
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{transcript.title}</h2>
        <p className="text-sm text-gray-500 mb-6">
          Created on {new Date(transcript.date).toLocaleDateString()}
        </p>

        <div className="prose max-w-none">
          {transcript.transcript.split('\n').map((line, index) => {
            const [speaker, ...textParts] = line.split(':')
            const text = textParts.join(':').trim()
            return (
              <div key={index} className="mb-4">
                <span className="font-semibold text-gray-900">{speaker}:</span>
                <span className="text-gray-700 ml-2">{text}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 