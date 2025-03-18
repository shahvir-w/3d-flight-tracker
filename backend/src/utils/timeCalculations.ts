import { parsedFlight } from "../types/parsedFlight";

// calculate timeElapse, timeRemaining, and totalTime
export const calculateFlightTimes = (targetFlight: parsedFlight | null, now: Date) => {
  if (!targetFlight) return { timeElapsed: null, timeRemaining: null, totalTime: null };

  // Convert current time to UTC for consistent calculations
  const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

  const toDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    // All API dates are in UTC, so parse them directly
    return new Date(dateStr);
  };

  const actualOut = toDate(targetFlight.actual_out);
  const actualIn = toDate(targetFlight.actual_in);
  const scheduledIn = toDate(targetFlight.scheduled_in);
  const estimatedIn = toDate(targetFlight.estimated_in);
  const scheduledOut = toDate(targetFlight.scheduled_out);
  const estimatedOut = toDate(targetFlight.estimated_out);

  // Check if the flight is in progress (started but not completed)
  const isInProgress = 
    (targetFlight.progress_percent !== undefined && 
     targetFlight.progress_percent > 0 && 
     (targetFlight.progress_percent < 100 || !actualIn)) || // Consider 100% progress as in-progress if no actual arrival
    (actualOut && !actualIn && nowUTC > actualOut) || // Has taken off but not landed
    (targetFlight.status && // Status indicates in air
      (targetFlight.status.toLowerCase().includes('in air') || 
       targetFlight.status.toLowerCase().includes('en route') ||
       targetFlight.status.toLowerCase().includes('departing') ||
       targetFlight.status.toLowerCase().includes('departed')));

  // Calculate total flight time first, as we'll use it to validate elapsed time
  let totalTime: number | null = null;
  if (actualOut && actualIn) {
    // Actual flight time for completed flights
    totalTime = (actualIn.getTime() - actualOut.getTime()) / (1000 * 60);
  } else if (isInProgress) {
    if (estimatedIn && actualOut) {
      // For in-progress flights with actual departure and estimated arrival
      totalTime = (estimatedIn.getTime() - actualOut.getTime()) / (1000 * 60);
    } else if (scheduledIn && actualOut) {
      // For in-progress flights with actual departure but no estimated arrival
      totalTime = (scheduledIn.getTime() - actualOut.getTime()) / (1000 * 60);
    } else if (scheduledIn && scheduledOut) {
      // For in-progress flights with only scheduled times
      totalTime = (scheduledIn.getTime() - scheduledOut.getTime()) / (1000 * 60);
    }
  } else if (scheduledIn && scheduledOut) {
    // Scheduled total time for upcoming flights
    totalTime = (scheduledIn.getTime() - scheduledOut.getTime()) / (1000 * 60);
  }

  // For time elapsed, we want to know how long since the flight departed
  let timeElapsed = 0;
  if (actualOut) {
    // If we have actual departure time, use that
    timeElapsed = Math.max(0, (nowUTC.getTime() - actualOut.getTime()) / (1000 * 60));
    
    // If we have total time, ensure elapsed doesn't exceed it
    if (totalTime !== null) {
      timeElapsed = Math.min(timeElapsed, totalTime);
    }
    
    // If we have progress percentage, use it to validate elapsed time
    if (targetFlight.progress_percent !== undefined && targetFlight.progress_percent > 0) {
      const progressBasedElapsed = (totalTime || 0) * (targetFlight.progress_percent / 100);
      // Use the smaller of the two calculations
      timeElapsed = Math.min(timeElapsed, progressBasedElapsed);
    }
  } else if (isInProgress && estimatedOut) {
    // For in-progress flights without actual departure, use estimated
    timeElapsed = Math.max(0, (nowUTC.getTime() - estimatedOut.getTime()) / (1000 * 60));
    if (totalTime !== null) {
      timeElapsed = Math.min(timeElapsed, totalTime);
    }
  } else if (isInProgress && scheduledOut) {
    // Last resort for in-progress flights
    timeElapsed = Math.max(0, (nowUTC.getTime() - scheduledOut.getTime()) / (1000 * 60));
    if (totalTime !== null) {
      timeElapsed = Math.min(timeElapsed, totalTime);
    }
  }

  // For time remaining, we need different logic depending on flight status
  let timeRemaining = 0;
  
  if (actualIn) {
    // Flight is completed
    timeRemaining = 0;
  } else if (isInProgress) {
    // Flight is in progress
    if (estimatedIn && estimatedIn > nowUTC) {
      // If we have a future estimated arrival time, use that
      timeRemaining = Math.max(0, (estimatedIn.getTime() - nowUTC.getTime()) / (1000 * 60));
    } else if (targetFlight.progress_percent !== undefined && targetFlight.progress_percent > 0) {
      // If we have progress percentage, calculate based on that
      const elapsedPercentage = Math.min(targetFlight.progress_percent / 100, 1);
      let totalEstimatedMinutes = totalTime || 0;
      
      if (totalEstimatedMinutes > 0) {
        timeRemaining = Math.max(0, totalEstimatedMinutes * (1 - elapsedPercentage));
      } else if (scheduledIn) {
        // Fallback to scheduled time if we couldn't calculate based on progress
        timeRemaining = Math.max(0, (scheduledIn.getTime() - nowUTC.getTime()) / (1000 * 60));
      }
    } else if (scheduledIn) {
      // Fall back to scheduled time
      timeRemaining = Math.max(0, (scheduledIn.getTime() - nowUTC.getTime()) / (1000 * 60));
    }
  } else if (!actualOut && scheduledOut && scheduledOut > nowUTC) {
    // Flight has not started yet
    if (estimatedIn && estimatedIn > nowUTC) {
      timeRemaining = (estimatedIn.getTime() - nowUTC.getTime()) / (1000 * 60);
    } else if (scheduledIn && scheduledIn > nowUTC) {
      timeRemaining = (scheduledIn.getTime() - nowUTC.getTime()) / (1000 * 60);
    }
  }

  // Validate that elapsed + remaining roughly equals total time
  if (totalTime !== null && timeElapsed + timeRemaining > totalTime * 1.1) { // Allow 10% margin for calculations
    // If the sum is too large, adjust elapsed time
    timeElapsed = Math.max(0, totalTime - timeRemaining);
  }

  const formatTime = (minutes: number | null): string | null => {
    if (minutes === null || isNaN(minutes)) return null;
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  };

  // Log the calculations for debugging
  console.log(`Time calculations for flight ${targetFlight.ident}:`, {
    isInProgress,
    status: targetFlight.status,
    progress: targetFlight.progress_percent,
    actualOut: actualOut?.toISOString(),
    actualIn: actualIn?.toISOString(),
    estimatedIn: estimatedIn?.toISOString(),
    totalTime: formatTime(totalTime),
    timeElapsed: formatTime(timeElapsed),
    timeRemaining: formatTime(timeRemaining),
    rawElapsed: timeElapsed,
    rawRemaining: timeRemaining,
    rawTotal: totalTime
  });

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