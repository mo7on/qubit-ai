"use client"

import { useEffect, useState } from "react"
import Joyride, { CallBackProps, Step } from "react-joyride"

export function ArticlesTour() {
  const [run, setRun] = useState(false)

  useEffect(() => {
    const hasSeenArticlesTour = localStorage.getItem("hasSeenArticlesTour")
    if (!hasSeenArticlesTour) {
      setRun(true)
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