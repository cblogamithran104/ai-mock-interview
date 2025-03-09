'use client'
import 'regenerator-runtime/runtime'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseconfig'

const FeedbackPage = () => {
  const params = useParams()
  const interviewId = params.interviewId

  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const feedbackDoc = doc(db, 'interviews', interviewId, 'feedback', 'summary')
        const feedbackSnap = await getDoc(feedbackDoc)

        if (feedbackSnap.exists()) {
          setFeedback(feedbackSnap.data())
        } else {
          setError('Feedback not found')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [interviewId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="p-6 bg-white shadow-md rounded-xl">
          <h1 className="text-2xl font-bold text-gray-800">Feedback</h1>
          <p className="mt-4 text-gray-600">Ranking: {feedback.ranking}</p>
          <p className="mt-4 text-gray-600">Comments: {feedback.comments}</p>
        </div>
      </div>
    </div>
  )
}

export default FeedbackPage