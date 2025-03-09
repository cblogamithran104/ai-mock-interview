'use client'
import React, { useEffect, useState } from 'react'
import { doc, setDoc, collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseconfig'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { toast } from 'sonner'

function RecordAnswerSection({ currentQuestion, onAnswerSave, interviewId, onStartRecording, onStopRecording }) {
  const [answerRating, setAnswerRating] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [recording, setRecording] = useState(false);

  const {
    transcript,
    interimTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    commands: [],
    continuous: true,
  })

  const saveAnswerToFirebase = async (answer) => {
    try {
      const answersRef = collection(db, 'interviews', interviewId, 'answers');
      await addDoc(answersRef, {
        questionNumber: currentQuestion + 1,
        answer: answer,
        timestamp: new Date().toISOString()
      });
      console.log('Answer saved to Firebase successfully:', answer);
    } catch (error) {
      console.error('Error saving answer to Firebase:', error);
      toast.error('Failed to save answer');
    }
  }

  useEffect(() => {
    if (transcript && !listening) {
      console.log(`Answer recorded for Question #${currentQuestion + 1}:`, transcript);
      saveAnswerToFirebase(transcript);
      onAnswerSave?.(transcript, currentQuestion);
      toast.success('Recording saved!', {
        description: `Answer recorded for Question #${currentQuestion + 1}`,
        duration: 3000,
        position: 'bottom-right',
      });
    }
  }, [transcript, listening])

  const startRecording = () => {
    setRecording(true);
    onStartRecording?.();
    SpeechRecognition.startListening({ continuous: true });
    console.log('Recording started...');
  };

  const stopRecording = async () => {
    setRecording(false);
    onStopRecording?.();
    SpeechRecognition.stopListening();
    console.log('Recording stopped...');

    if (transcript) {
      console.log(`Final Answer for Question #${currentQuestion + 1}:`, transcript);
      const answerDoc = doc(db, 'interviews', interviewId, 'answers', currentQuestion.toString());
      await setDoc(answerDoc, { answer: transcript });

      window.location.href = `/dashboard/interview/${interviewId}/feedback`;
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-4 rounded-lg bg-yellow-50">
        <p className="text-yellow-700">Browser doesn't support speech recognition.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-center">
        <button 
          onClick={recording ? stopRecording : startRecording}
          className={`px-6 py-2.5 text-white text-sm font-medium transition-all rounded-lg hover:shadow-md active:scale-95 ${
            recording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {recording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
    </div>
  )
}

export default RecordAnswerSection