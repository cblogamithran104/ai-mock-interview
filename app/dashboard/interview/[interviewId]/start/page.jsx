'use client'
import 'regenerator-runtime/runtime'
import React, { useState, useEffect, useRef, use } from 'react'
import Webcam from 'react-webcam'
import Image from 'next/image'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { toast, Toaster } from 'sonner'
import RecordAnswerSection from '@/app/dashboard/_components/RecordAnswerSection'
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

function StartInterview({ params: paramsPromise }) {
  const params = use(paramsPromise); // ✅ Fix: Unwrap params using use()
  const interviewId = params.interviewId; // Now accessible safely

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [browserSupport, setBrowserSupport] = useState(true)
  const webcamRef = useRef(null)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [answers, setAnswers] = useState([])
  const [recordingStarted, setRecordingStarted] = useState(false)

  const {
    transcript,
    interimTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    continuous: true,
  })

  const { speak, stop, isSpeaking } = useTextToSpeech();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setBrowserSupport(false)
    }
  }, [browserSupportsSpeechRecognition])

  if (!browserSupport) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-700">Browser doesn't support speech recognition.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    let mounted = true

    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/interviews/${interviewId}/questions`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        if (mounted) {
          setQuestions(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching questions:', error)
        if (mounted) setLoading(false)
      }
    }

    fetchQuestions()
    return () => {
      mounted = false
    }
  }, [interviewId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      const currentQuestionText = `Question ${currentQuestion + 1}: ${questions[currentQuestion]?.question}`;
      speak(currentQuestionText);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors />
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col space-y-4">
            <div className="p-6 bg-white shadow-md rounded-xl">
              <div className="flex flex-wrap gap-2 mb-6">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      currentQuestion === index ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Question #{index + 1}
                  </button>
                ))}
              </div>
              
              <div className="p-4 mb-8 border border-gray-100 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">
                  {questions[currentQuestion]?.question}
                </h2>
                
                <div className="flex justify-start mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSpeak}
                    className="flex items-center gap-2"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-5 h-5" />
                        <span>Stop Reading</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5" />
                        <span>Read Question</span>
                      </>
                    )}
                  </Button>
                </div>

                {!recordingStarted && (
                  <div className="p-4 mt-4 border border-blue-100 rounded-lg bg-blue-50">
                    <h3 className="text-lg font-semibold text-blue-700">Tips before you start recording:</h3>
                    <ul className="mt-2 text-blue-700 list-disc list-inside">
                      <li>Ensure you are in a quiet environment.</li>
                      <li>Speak clearly and confidently.</li>
                      <li>Take a moment to think before you answer.</li>
                      <li>Provide detailed and structured responses.</li>
                      <li>Maintain good posture and eye contact with the camera.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="overflow-hidden bg-white shadow-md rounded-xl">
              {isCameraOn ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ width: 640, height: 360, facingMode: "user" }}
                  className="w-full rounded-xl"
                />
              ) : (
                <div className="relative flex items-center justify-center w-full h-[360px] bg-gray-100 rounded-xl">
                  <Image src="/camera.svg" alt="Camera placeholder" fill className="object-cover rounded-xl" priority />
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <RecordAnswerSection 
                currentQuestion={currentQuestion}
                interviewId={interviewId}
                onStartRecording={() => setRecordingStarted(true)}
              />
              <button 
                className="px-6 py-2.5 text-white text-sm font-medium transition-all bg-blue-500 rounded-lg hover:bg-blue-600 hover:shadow-md active:scale-95"
                onClick={() => setIsCameraOn(!isCameraOn)}
              >
                {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StartInterview
