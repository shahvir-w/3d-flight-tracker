import { Request, Response } from "express-serve-static-core";
import { parseFlightData, parseFlightPositionData } from "../utils/parseData";
import { FlightsData } from "../types/AreoAPI";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const API_KEY = process.env.API_KEY;
const AeroAPI_URL: string = `https://aeroapi.flightaware.com/aeroapi/flights/`;

export const getFlightData = async (req: Request, res: Response): Promise<void> => {
    try {
        let { flightNum } = req.params;
        flightNum = flightNum.toUpperCase();

        // Fetch flight data
        const response = await axios.get(`${AeroAPI_URL}${flightNum}`, {
            headers: { "x-apikey": API_KEY },
        });

        const flights = response.data as FlightsData;
        let { targetFlight, twoUpcomingFlights, twoPreviousFlights } = parseFlightData(flights);

        let updatedTargetFlight = targetFlight;

        if (targetFlight) {
            try {
                const positionResponse = await axios.get(`${AeroAPI_URL}${targetFlight.fa_flight_id}/position`, {
                    headers: { "x-apikey": API_KEY },
                });

                const positionData = parseFlightPositionData(positionResponse.data, targetFlight);
                updatedTargetFlight = positionData.updatedTargetFlight ?? targetFlight;
            } catch (positionError) {
                console.error("Error fetching flight position data:", positionError);
            }
        }

        res.status(200).json({
            updatedTargetFlight,
            twoUpcomingFlights,
            twoPreviousFlights,
        });

    } catch (error) {
        console.error("Error fetching flight data:", error);
        res.status(500).json({ error: "Failed to fetch flight data" });
    }
};

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