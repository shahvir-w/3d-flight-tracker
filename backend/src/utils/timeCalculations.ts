import { parsedFlight } from "../types/parsedFlight";

// calculate timeElapse, timeRemaining, and totalTime
export const calculateFlightTimes = (targetFlight: parsedFlight | null, now: Date) => {
  if (!targetFlight) return { timeElapsed: null, timeRemaining: null, totalTime: null };

  const toDate = (timeStr: string | null | undefined) => {
    if (!timeStr) {
      return null;
    }

    // Get the current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]; // Extracts "YYYY-MM-DD" part
    const dateTimeStr = `${today}T${timeStr}`;  // Combine date and time

    const parsedDate = new Date(dateTimeStr);

    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date:', dateTimeStr);  // Log invalid date for debugging
      return null;  // Return null for invalid date
    }

    return parsedDate;
  };

  const actualOut = toDate(targetFlight.actual_out);
  const actualIn = toDate(targetFlight.actual_in);
  const scheduledIn = toDate(targetFlight.scheduled_in);
  const estimatedIn = toDate(targetFlight.estimated_in);
  const scheduledOut = toDate(targetFlight.scheduled_out);

  console.log("scheduledOut: ", scheduledOut);  // Should now log a valid date or null
  console.log("scheduledIn: ", scheduledIn);  // Should now log a valid date or null

  // Calculate timeElapsed (ensure actualOut is valid, else use scheduledOut)
  const timeElapsed = actualOut
    ? Math.max(0, (now.getTime() - actualOut.getTime()) / (1000 * 60))
    : scheduledOut
    ? Math.max(0, (now.getTime() - scheduledOut.getTime()) / (1000 * 60))
    : 0;

  // Calculate timeRemaining (ensure estimatedIn is valid, else use scheduledIn)
  const timeRemaining = estimatedIn
    ? Math.max(0, (estimatedIn.getTime() - now.getTime()) / (1000 * 60))
    : scheduledIn
    ? Math.max(0, (scheduledIn.getTime() - now.getTime()) / (1000 * 60))
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