import { useEffect, useState } from 'react'

function remainingSeconds(targetIso: string | null): number {
  if (!targetIso) return 0
  const target = new Date(targetIso).getTime()
  if (Number.isNaN(target)) return 0
  return Math.max(0, Math.ceil((target - Date.now()) / 1000))
}

export function useResendCountdown(targetIso: string | null): number {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!targetIso) return
    if (remainingSeconds(targetIso) <= 0) return

    const interval = window.setInterval(() => {
      if (remainingSeconds(targetIso) <= 0) {
        window.clearInterval(interval)
      }
      setTick((value) => value + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [targetIso])

  return targetIso ? remainingSeconds(targetIso) : 0
}

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
