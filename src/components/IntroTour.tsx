"use client"

import { useEffect, useState } from "react"
import Joyride, { CallBackProps, Step } from "react-joyride"

export function IntroTour() {
  const [run, setRun] = useState(false)

  useEffect(() => {
    // Move localStorage check to useEffect without conditional
    const hasSeenTour = localStorage.getItem("hasSeenTour")
    if (!hasSeenTour) {
      setRun(true)
      localStorage.setItem("hasSeenTour", "true")
    }
  }, [])

  const steps: Step[] = [
    {
      target: "body",
      content: "Welcome! let us show you how to navigate through your website :)",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: ".articles-button",
      content: "This is the articles page, where you can see if your issue is already present by going to the articles page or by typing in the text bar and seeing if an article is suggested!",
      placement: "top",
    },
    {
      target: ".photo-upload-button",
      content: "From here you can upload an already taken photo and send it!",
      placement: "top",
      floaterProps: {
        disableAnimation: true,
      },
      spotlightPadding: 10,
    },
    {
      target: ".textbar-container",
      content: "This textbar allows you to communicate with our powerful AI chatbot and take a photo right away!",
      placement: "top",
      floaterProps: {
        disableAnimation: true,
      },
      spotlightPadding: 20,
    },
  ]

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    if (["FINISHED", "SKIPPED"].includes(status)) {
      setRun(false)
      localStorage.setItem("hasSeenTour", "true")
    }
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      hideCloseButton
      disableCloseOnEsc
      disableOverlayClose
      spotlightClicks
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          backgroundColor: "#000000",
          textColor: "white",
          zIndex: 1000,
          arrowColor: "hsl(var(--primary))",
        },
        spotlight: {
          borderRadius: "12px",
        },
        tooltip: {
          borderRadius: "16px",
          backgroundColor: "#000000",
          border: "2px solid hsl(var(--primary))",
          boxShadow: "0 4px 12px rgba(255, 255, 255, 0.15)",
        },
        tooltipContent: {
          padding: "20px",
          color: "white",
          fontSize: "0.95rem",
          lineHeight: "1.5",
        },
        tooltipTitle: {
          color: "white",
          fontWeight: "600",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          borderRadius: "8px",
          padding: "8px 16px",
        },
        buttonBack: {
          color: "hsl(var(--primary))",
          marginRight: "8px",
        },
        buttonSkip: {
          color: "#666",
        },
      }}
      callback={handleJoyrideCallback}
    />
  )
}