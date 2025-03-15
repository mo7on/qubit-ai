"use client"

import { useEffect, useState } from "react"
import Joyride, { CallBackProps, Step } from "react-joyride"

export function ArticlesTour() {
  const [run, setRun] = useState(false)

  useEffect(() => {
    const hasSeenArticlesTour = localStorage.getItem("hasSeenArticlesTour")
    if (!hasSeenArticlesTour) {
      setRun(true)
      localStorage.setItem("hasSeenArticlesTour", "true")
    }
  }, [])

  const steps: Step[] = [
    {
      target: "body",
      content: "Welcome to the Articles page! Let us show you around.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: ".history-button",
      content: "This is the tickets history where you can see your past inqueries",
      placement: "top",
    },
  ]

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    if (["FINISHED", "SKIPPED"].includes(status)) {
      setRun(false)
      localStorage.setItem("hasSeenArticlesTour", "true")
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