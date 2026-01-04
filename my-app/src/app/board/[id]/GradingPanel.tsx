'use client'

import { useState, RefObject } from 'react'
import { Editor, getSnapshot } from 'tldraw'
import { gradeDiagram, GradeResponse } from '@/app/actions'

interface GradingPanelProps {
  editorRef: RefObject<Editor | null>
  onClose: () => void
}

export default function GradingPanel({ editorRef, onClose }: GradingPanelProps) {
  const [problemStatement, setProblemStatement] = useState('')
  const [isGrading, setIsGrading] = useState(false)
  const [result, setResult] = useState<GradeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [resetAt, setResetAt] = useState<number | null>(null)

  const handleGrade = async () => {
    if (!editorRef.current || !problemStatement.trim()) return

    setIsGrading(true)
    setError(null)
    setResult(null)

    try {
      const snapshot = getSnapshot(editorRef.current.store)
      const response = await gradeDiagram(snapshot, problemStatement.trim())

      if (response.success) {
        setResult(response.result)
        setRemaining(response.remaining)
      } else {
        setError(response.error)
        if (response.resetAt) {
          setResetAt(response.resetAt)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.')
      console.error(err)
    } finally {
      setIsGrading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    if (score >= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="w-96 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">AI Grading</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          &times;
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Problem Statement Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Problem Statement
          </label>
          <textarea
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            placeholder="e.g., Design a URL shortener like bit.ly that handles 100M daily active users"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-28 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Grade Button */}
        <button
          onClick={handleGrade}
          disabled={isGrading || !problemStatement.trim()}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isGrading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analyzing...
            </span>
          ) : (
            'Grade My Design'
          )}
        </button>

        {/* Rate Limit Info */}
        {remaining !== null && (
          <p className="text-sm text-gray-500 text-center">
            {remaining}/5 grades remaining this hour
          </p>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
            {resetAt && (
              <p className="mt-1 text-xs">
                Resets at {new Date(resetAt).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Score */}
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <span className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}
              </span>
              <span className="text-2xl text-gray-400">/10</span>
            </div>

            {/* Feedback */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Feedback</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{result.feedback}</p>
            </div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <div>
                <h3 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                  <span>✓</span> Strengths
                </h3>
                <ul className="space-y-1">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-green-500">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {result.weaknesses.length > 0 && (
              <div>
                <h3 className="font-medium text-orange-700 mb-2 flex items-center gap-1">
                  <span>!</span> Weaknesses
                </h3>
                <ul className="space-y-1">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-orange-500">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Components */}
            {result.missingComponents.length > 0 && (
              <div>
                <h3 className="font-medium text-blue-700 mb-2 flex items-center gap-1">
                  <span>+</span> Missing Components
                </h3>
                <ul className="space-y-1">
                  {result.missingComponents.map((c, i) => (
                    <li key={i} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Security Risks */}
            {result.securityRisks.length > 0 && (
              <div>
                <h3 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                  <span>⚠</span> Security Risks
                </h3>
                <ul className="space-y-1">
                  {result.securityRisks.map((r, i) => (
                    <li key={i} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-red-500">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
