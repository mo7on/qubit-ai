"use client"

import * as React from "react"
import { Camera, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void
  onCancel: () => void
}

/**
 * CameraCapture Component
 * 
 * A component that provides camera access and photo capture functionality.
 * 
 * @component
 * @param {CameraCaptureProps} props - Component props
 */
export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null)

  // Initialize camera on component mount
  React.useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        })
        
        setStream(mediaStream)
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError("Could not access camera. Please ensure you've granted camera permissions.")
      }
    }

    startCamera()

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Handle taking a photo
  const handleCapture = React.useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas to data URL
        const imageSrc = canvas.toDataURL('image/jpeg')
        setCapturedImage(imageSrc)
      }
    }
  }, [])

  // Handle retaking a photo
  const handleRetake = React.useCallback(() => {
    setCapturedImage(null)
  }, [])

  // Handle confirming the captured photo
  const handleConfirm = React.useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }, [capturedImage, onCapture])

  return (
    <div className="flex flex-col items-center">
      {error ? (
        <div className="text-center p-4 bg-destructive/10 text-destructive rounded-md">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onCancel}
          >
            Close
          </Button>
        </div>
      ) : capturedImage ? (
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="rounded-md max-h-[50vh] mx-auto"
            />
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={handleRetake}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retake
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex items-center gap-2"
            >
              Use Photo
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-black rounded-md overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="max-h-[50vh] mx-auto"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCapture}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}