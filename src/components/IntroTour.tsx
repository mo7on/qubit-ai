"use client"

import { useEffect, useState } from "react"
import Joyride, { CallBackProps, Step } from "react-joyride"

export function IntroTour() {
  const [run, setRun] = useState(false)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour")
    if (!hasSeenTour) {
      setRun(true)
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
          backgroundColor: "rgb(64, 64, 64)",
          textColor: "white",
          zIndex: 1000,
        },
        spotlight: {
          borderRadius: "12px",
        },
        tooltip: {
          borderRadius: "12px",
          backgroundColor: "rgb(64, 64, 64)",
        },
        tooltipContent: {
          padding: "20px",
          color: "white",
        },
        tooltipTitle: {
          color: "white",
        },
      }}
      callback={handleJoyrideCallback}
    />
  )
}