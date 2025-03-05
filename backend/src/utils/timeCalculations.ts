import { parsedFlight } from "../types/parsedFlight";

// calculate timeElapse, timeRemaining, and totalTime
export const calculateFlightTimes = (targetFlight: parsedFlight | null, now: Date) => {
  if (!targetFlight) return { timeElapsed: null, timeRemaining: null, totalTime: null };


  const toDate = (dateStr: string | null | undefined) => (dateStr ? new Date(dateStr) : null);

  const actualOut = toDate(targetFlight.actual_out);
  const actualIn = toDate(targetFlight.actual_in);
  const scheduledIn = toDate(targetFlight.scheduled_in);
  const estimatedIn = toDate(targetFlight.estimated_in);
  const scheduledOut = toDate(targetFlight.scheduled_out);

  const timeElapsed = actualOut
    ? Math.max(0, (now.getTime() - actualOut.getTime()) / (1000 * 60))
    : scheduledOut
    ? Math.max(0, (now.getTime() - scheduledOut.getTime()) / (1000 * 60))
    : 0;

  const timeRemaining = estimatedIn
    ? Math.max(0, (estimatedIn.getTime() - now.getTime()) / (1000 * 60))
    : scheduledIn
    ? Math.max(0, (scheduledIn.getTime() - now.getTime()) / (1000 * 60))
    : 0;

  let totalTime: number | null = null;
  if (actualOut && actualIn) {
    totalTime = (actualIn.getTime() - actualOut.getTime()) / (1000 * 60);
  } else if (estimatedIn && actualOut) {
    totalTime = (estimatedIn.getTime() - actualOut.getTime()) / (1000 * 60);
  } else if (scheduledIn && scheduledOut) {
    totalTime = (scheduledIn.getTime() - scheduledOut.getTime()) / (1000 * 60);
  }

  const formatTime = (minutes: number | null): string | null => {
    if (minutes === null || isNaN(minutes)) return null;
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  };

  return {
    timeElapsed: formatTime(timeElapsed),
    timeRemaining: formatTime(timeRemaining),
    totalTime: formatTime(totalTime),
  };
};

export const convertToEasternDateTime = (utcDate: string | null): string => {
  if (!utcDate) {
    return '';
  }

  const date = new Date(utcDate);
  
  const easternDateTimeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  const easternFormatted = new Intl.DateTimeFormat('en-US', easternDateTimeOptions).format(date);
  
  const [month, day, year, hour, minute, second] = easternFormatted.split(/[\/, ]+/);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`.slice(0,19) + "Z";
};