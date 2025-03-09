"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/db';
import Link from 'next/link';
import Webcam from 'react-webcam';

export default function Interview() {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const [isCameraOn, setIsCameraOn] = useState(false);
  const webcamRef = React.useRef(null);
  const [hasWebcamPermission, setHasWebcamPermission] = useState(false);

  // Handle camera toggle
  const toggleCamera = async () => {
    try {
      if (!hasWebcamPermission) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasWebcamPermission(true);
      }
      setIsCameraOn(!isCameraOn);
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera. Please check your permissions.');
    }
  };

  // Add webcam permission check
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setHasWebcamPermission(true))
      .catch((err) => console.error('Webcam access denied:', err));
  }, []);

  useEffect(() => {
    async function fetchInterview() {
      try {
        const interviewId = params.interviewId;
        console.log("Fetching interview with ID:", interviewId);

        if (!interviewId) {
          setError("Invalid interview ID");
          setLoading(false);
          return;
        }

        const docRef = doc(db, "interviews", interviewId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Interview found:", docSnap.data());
          setInterview(docSnap.data());
        } else {
          console.log("Interview NOT FOUND for ID:", interviewId);
          setError("Interview not found");
        }
      } catch (err) {
        console.error("Error fetching interview:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.interviewId) {
      fetchInterview();
    }
  }, [params.interviewId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">{error}</p>
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-4">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center space-y-4">
            {/* Header */}
            <h1 className="mb-2 text-3xl font-bold text-gray-800">Let's Get Started</h1>
            
            {/* Info Box */}
            <div className="flex items-center w-full max-w-xl gap-3 p-3 mb-2 border border-blue-100 rounded-lg bg-blue-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0 w-5 h-5 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
              </svg>
              <p className="text-sm text-blue-700">
                Enable your camera and position yourself in a well-lit environment for the best interview experience.
                NOTE: This is a mock interview and your video will not be recorded.
              </p>
            </div>

            {/* Camera Toggle Button */}
            <button
              onClick={toggleCamera}
              className="px-6 py-2.5 text-white text-sm font-medium transition-all bg-blue-500 rounded-lg hover:bg-blue-600 hover:shadow-md active:scale-95"
            >
              {isCameraOn ? 'Turn Off Camera and Microphone' : 'Turn On Camera and Microphone'}
            </button>

            {/* Main Content */}
            <div className="flex flex-wrap items-start justify-center gap-6 mt-4">
              {/* Job Details Card */}
              {interview && (
                <div className="w-[320px] bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-semibold text-gray-800">{interview.jobRole}</h2>
                  <p className="mt-2 text-gray-600">Experience: {interview.yearsOfExperience} years</p>
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-700">Job Description:</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{interview.jobDescription}</p>
                  </div>
                </div>
              )}

              {/* Camera Section */}
              <div className="flex flex-col items-center">
                {isCameraOn && hasWebcamPermission ? (
                  <div className="overflow-hidden rounded-xl shadow-md w-[640px] hover:shadow-lg transition-shadow">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        width: 640,
                        height: 320,
                        facingMode: "user"
                      }}
                      className="rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-[640px] h-[320px] bg-gray-100 rounded-xl shadow-md border-2 border-dashed border-gray-200">
                    <img src="/camera.svg" alt="Camera Placeholder" className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <div className="flex justify-end w-full mt-4">
                  <Link href={'/dashboard/interview/' + params.interviewId + '/start'}>
                    <button
                      className="px-6 py-2.5 text-white text-sm font-medium transition-all bg-green-500 rounded-lg hover:bg-green-600 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isCameraOn || !hasWebcamPermission}
                      onClick={() => {/* Add your start interview logic here */}}
                    >
                      Start Interview
                    </button>
                  </Link>
                </div>

                {!hasWebcamPermission && isCameraOn && (
                  <p className="px-4 py-2 mt-3 text-sm text-red-500 rounded-lg bg-red-50">
                    Please allow camera access to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}