export function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

export function parseTimestamp(timeStr: string): number | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!match) return null

  const [, first, second, third] = match
  if (third) {
    return parseInt(first) * 3600 + parseInt(second) * 60 + parseInt(third)
  }
  return parseInt(first) * 60 + parseInt(second)
}
