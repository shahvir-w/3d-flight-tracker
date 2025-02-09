import { Request, Response } from "express-serve-static-core";
import dotenv from "dotenv";
import axios from "axios";
//import {flightData, flightPositionData} from '../flightData'
import { parseFlightData, parseFlightPositionData } from "../utils/parseData";
import { FlightsData } from "../models/AreoAPI";
dotenv.config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("API_KEY is undefined.");
}

const AeroAPI_URL: string = `https://aeroapi.flightaware.com/aeroapi/flights/`;

export const getFlightData = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("API Key:", API_KEY); // Check if it's correctly loaded

        const now = new Date();
        const { flightNum } = req.params;
        console.log(flightNum)
        const response = await axios.get(`${AeroAPI_URL}${flightNum}`, {
            headers: {
                "x-apikey": API_KEY,
            },
        });
        
        console.log(response)
        const flights = response.data as FlightsData;
        
        let { targetFlight, twoUpcomingFlights, twoPreviousFlights } = parseFlightData(flights);
        
        if (targetFlight) {
            const response = await axios.get(`${AeroAPI_URL}${targetFlight.fa_flight_id}/position`, {
                headers: {
                    "x-apikey": API_KEY,
                },
            });
        }

        const flightPositionData = response.data;
        
        const updatedTargetFlight = targetFlight ? parseFlightPositionData(flightPositionData, targetFlight) : targetFlight;


        res.status(200).json({
            updatedTargetFlight,
            twoUpcomingFlights,
            twoPreviousFlights,
        });

    } catch (error) {
        res.status(500).json({ error: error });
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