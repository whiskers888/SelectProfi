import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatCountdown, useResendCountdown } from './useResendCountdown'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function isoIn(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString()
}

describe('useResendCountdown', () => {
  it('shows the correct value on first render and counts down to zero', () => {
    vi.useFakeTimers()
    const target = isoIn(60)

    const { result } = renderHook(() => useResendCountdown(target))

    expect(result.current).toBe(60)
    expect(formatCountdown(result.current)).toBe('01:00')

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current).toBe(58)

    act(() => {
      vi.advanceTimersByTime(58000)
    })

    expect(result.current).toBe(0)
    expect(formatCountdown(result.current)).toBe('00:00')
  })

  it('switches to the new target immediately after a resend', () => {
    vi.useFakeTimers()
    const shortTarget = isoIn(5)
    const longTarget = isoIn(60)

    const { result, rerender } = renderHook(
      ({ target }: { target: string | null }) => useResendCountdown(target),
      { initialProps: { target: shortTarget } },
    )

    expect(result.current).toBe(5)

    rerender({ target: longTarget })

    expect(result.current).toBe(60)
  })

  it('returns zero when there is no target', () => {
    const { result } = renderHook(() => useResendCountdown(null))
    expect(result.current).toBe(0)
  })
})
