import { Request, Response } from "express-serve-static-core";
import dotenv from "dotenv";
import axios from "axios";
import {flightData, flightPositionData} from '../flightData'

dotenv.config();

type Flight = {
    ident: string;
    fa_flight_id: string;
    origin: {
        airport_code: string;
        airport_name: string;
    };
    destination: {
        airport_code: string;
        airport_name: string;
    };
    scheduled_out: string;
    estimated_out?: string | null;
    actual_out?: string | null;
    scheduled_in: string;
    estimated_in?: string | null;
    actual_in?: string | null;
    progress_percent?: number;
    status: string;
    route_distance?: number;
    aircraft_type: string;
};


const API_KEY = process.env.API_KEY;
const AeroAPI_URL: string = `https://aeroapi.flightaware.com/aeroapi/flights/`;

export const getFlightData = async (req: Request, res: Response): Promise<void> => {
    try {
        const now = new Date();
        const { flightNum } = req.params;

        /*
        const flightData = await axios.get(`${AeroAPI_URL}${flightNum}`, {
            headers: {
                "x-apikey": API_KEY, // Pass the API key in the headers
            },
            timeout: 1500,
        });
        
        */

        

        // sort flights based on date ascending
        const sortedFlights = flightData.flights.sort(
            (a, b) => new Date(a.scheduled_out).getTime() - new Date(b.scheduled_out).getTime()
        );

        let targetFlight: Flight | null = null;
        let previousFlights: Flight[] = [];
        let upcomingFlights: Flight[] = [];

        for (let i = 0; i < sortedFlights.length; i++) {
            const flight = sortedFlights[i];
            
            // Flight data needed
            const simplifiedFlight: Flight = {
                ident: flight.ident,
                fa_flight_id: flight.fa_flight_id,
                origin: {
                    airport_code: flight.origin.code_iata,
                    airport_name: flight.origin.name,
                },
                destination: {
                    airport_code: flight.destination.code_iata,
                    airport_name: flight.destination.name,
                },
                scheduled_out: flight.scheduled_out,
                estimated_out: flight.estimated_out,
                actual_out: flight.actual_out,
                scheduled_in: flight.scheduled_in,
                estimated_in: flight.estimated_in,
                actual_in: flight.actual_in,
                progress_percent: flight.progress_percent,
                status: flight.status,
                route_distance: flight.route_distance,
                aircraft_type: flight.aircraft_type,
            };

            const scheduledOut = new Date(flight.scheduled_out);
            const scheduledIn = new Date(flight.scheduled_in);

            const threeHoursAfterLanding = new Date(scheduledIn);
            threeHoursAfterLanding.setHours(threeHoursAfterLanding.getHours() + 3);

            // Determine target flight (either en route, landed within 3 hours, or next departure)
            if (!targetFlight && ((flight.progress_percent > 0 && flight.progress_percent < 100) || scheduledOut > now || now < threeHoursAfterLanding)) {
                targetFlight = simplifiedFlight;
            } else if (targetFlight) { // upcoming flights
                upcomingFlights.push(simplifiedFlight);
            } else { // previous flights
                previousFlights.push(simplifiedFlight);
            }
        }

        let twoUpcomingFlights: Flight[] = [];
        let twoPreviousFlights: Flight[] = [];
        previousFlights.reverse();

        for (let i = 0; i < 2; i++) {
            twoUpcomingFlights[i] = upcomingFlights[i];
            twoPreviousFlights[i] = previousFlights[i]
        }
        
        // Convert timestamps to Date objects
        const actualOff = targetFlight?.actual_out ? new Date(targetFlight.actual_out) : null;
        const scheduledIn = targetFlight?.scheduled_in ? new Date(targetFlight.scheduled_in) : null;

        // Calculate time elapsed
        const timeElapsed = actualOff ? Math.max(0, (now.getTime() - actualOff.getTime()) / 1000 / 60) : null; // in minutes

        // Calculate time remaining
        const timeRemaining = scheduledIn ? Math.max(0, (scheduledIn.getTime() - now.getTime()) / 1000 / 60) : null; // in minutes
        
        const percentFlightCompletion: number = targetFlight?.progress_percent ? targetFlight.progress_percent / 100 : 0;
        const routeDistance: number = targetFlight?.route_distance ?? 0;
        const distanceRemaining: number = routeDistance * (1 - percentFlightCompletion);

        const calculatedData = {
            timeElapsed: timeElapsed,
            timeRemaining: timeRemaining, 
            distanceRemaining: distanceRemaining
        }


        /*
        const flightPositiionData = await axios.get(`${AeroAPI_URL}${targetFlight.fa_flight_id}/position`, {
            headers: {
                "x-apikey": API_KEY, // Pass the API key in the headers
            },
        });
        
        */
        
        const lastPosition = flightPositionData.last_position;

        const positionData = {
            time_now: now,
            latitude: lastPosition.latitude,
            longitude: lastPosition.longitude,
            altitude: lastPosition.altitude,
            groundSpeed: lastPosition.groundspeed,
        };
        
        if (targetFlight) {
            targetFlight = {
                ...targetFlight,
                ...positionData,
                ...calculatedData,
            };
        }

        res.status(200).json({
            targetFlight,
            twoUpcomingFlights,
            twoPreviousFlights,
        });

    } catch (error) {
        res.status(500).json({ message: "An error occurred." });
    }
}


export const getSavedFlight = async (req: Request, res: Response) => {
    try {
        res.status(200).json({ message: "success" });
    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ message: err.message });
    }
};

export const addSavedFlight = async (req: Request, res: Response) => {
    try {
        res.status(200).json({ message: "success" });
    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ message: err.message });
    }
};