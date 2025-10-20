// Helpers for time (kept minimal; main logic uses luxon in services)
export function pad(n: number) { return String(n).padStart(2, '0') }
