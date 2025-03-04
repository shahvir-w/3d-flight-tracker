import { parsedFlight } from "../types/parsedFlight";

// calculate timeElapse, timeRemaining, and totalTime
export const calculateFlightTimes = (targetFlight: parsedFlight | null, now: Date) => {
  if (!targetFlight) return { timeElapsed: null, timeRemaining: null, totalTime: null };

  const toDate = (timeStr: string | null | undefined, referenceDate: Date) => {
    if (!timeStr) return null;
  
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const dateTime = new Date(referenceDate);
    dateTime.setHours(hours, minutes, seconds || 0);
  
    // If the time is earlier than the current time, assume it's the next day
    if (dateTime < referenceDate) {
      dateTime.setDate(dateTime.getDate() + 1);
    }
  
    return dateTime;
  };

  const nowEastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

  const actualOut = toDate(targetFlight.actual_out, nowEastern);
  const actualIn = toDate(targetFlight.actual_in, nowEastern);
  const scheduledIn = toDate(targetFlight.scheduled_in, nowEastern);
  const estimatedIn = toDate(targetFlight.estimated_in, nowEastern);
  const scheduledOut = toDate(targetFlight.scheduled_out, nowEastern);

  console.log("scheduledOut: ", scheduledOut);  // Should now log a valid date or null
  console.log("scheduledIn: ", scheduledIn);  // Should now log a valid date or null

  // Calculate timeElapsed (ensure actualOut is valid, else use scheduledOut)
  const timeElapsed = actualOut
    ? Math.max(0, (nowEastern.getTime() - actualOut.getTime()) / (1000 * 60))
    : scheduledOut
    ? Math.max(0, (nowEastern.getTime() - scheduledOut.getTime()) / (1000 * 60))
    : 0;

  // Calculate timeRemaining (ensure estimatedIn is valid, else use scheduledIn)
  const timeRemaining = estimatedIn
    ? Math.max(0, (estimatedIn.getTime() - nowEastern.getTime()) / (1000 * 60))
    : scheduledIn
    ? Math.max(0, (scheduledIn.getTime() - nowEastern.getTime()) / (1000 * 60))
    : 0;

  // Calculate totalTime based on either actual out/in times or scheduled ones
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

export const convertToEasternTime = (utcDate: string | null): string => {
  if (!utcDate) {
    return '';  // Return an empty string or any fallback value if the date is null
  }

  const date = new Date(utcDate);  // Parse UTC string to Date object
  const easternTimeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',  
  };

  // Format the date in Eastern Time
  const easternTime = new Intl.DateTimeFormat('en-US', easternTimeOptions).format(date);

  return easternTime;
};

export const convertToEasternDate = (utcDate: string | null): string => {
  if (!utcDate) {
    return ''; // Handle null dates gracefully
  }

  const date = new Date(utcDate); // Parse UTC date
  const easternDateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  // Format to "MM/DD/YYYY" format in Eastern Time
  return new Intl.DateTimeFormat('en-US', easternDateOptions).format(date);
};