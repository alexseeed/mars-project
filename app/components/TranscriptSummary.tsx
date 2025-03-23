'use client'

import { useEffect, useState } from 'react'

interface TranscriptSummary {
  keywords: string[]
  actionItems: string
  outline: string | null
  shorthandBullet: string
  overview: string
  bulletGist: string
  gist: string
  shortSummary: string
}

interface Transcript {
  id: string
  title: string
  created_at: string
  summary: TranscriptSummary
}

export default function TranscriptSummary() {
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/transcript')
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
          Created on {new Date(transcript.created_at).toLocaleDateString()}
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Overview</h3>
            <p className="text-gray-700">{transcript.summary.overview}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Key Points</h3>
            <div className="space-y-2">
              {transcript.summary.bulletGist.split('\n').map((point, index) => (
                <p key={index} className="text-gray-700">{point}</p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {transcript.summary.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Action Items</h3>
            <div className="prose max-w-none">
              {transcript.summary.actionItems.split('\n').map((item, index) => (
                <p key={index} className="text-gray-700">{item}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 