import { Request, Response } from "express-serve-static-core";
import { parseFlightData, parseFlightPositionData } from "../utils/parseData";
import { FlightsData } from "../types/AreoAPI";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const API_KEY = process.env.AERO_API_KEY;
const AeroAPI_URL: string = `https://aeroapi.flightaware.com/aeroapi/flights/`;

// get all flight data
export const getFlightData = async (req: Request, res: Response): Promise<void> => {
    try {
        let { flightNum } = req.params;
        flightNum = flightNum.toUpperCase();

        // Fetch flight data 
        const response = await axios.get(`${AeroAPI_URL}${flightNum}`, {
            headers: { "x-apikey": API_KEY },
        });

        const data = response.data as FlightsData;

        
        if (!data.flights || data.flights.length === 0) {
          res.status(404).json({
              message: `Flight ${flightNum} has not flown in the past 14 days.`,
          });
          return
        }

        let { targetFlight, twoUpcomingFlights, twoPreviousFlights } = await parseFlightData(data);

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

// get saved flights
export const getSavedFlight = async (req: Request, res: Response) => {
    try {
      const savedFlights = req.cookies.savedFlights ? JSON.parse(req.cookies.savedFlights) : [];
      res.status(200).json(savedFlights);
    } catch (error: unknown) {
      console.error("Error fetching saved flights:", error);
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  };

// add a saved flight
export const addSavedFlight = async (req: Request, res: Response) => {
    const { flightNumber, departureCityData, arrivalCityData } = req.body;
  
    try {
      const savedFlight = {
        flightNumber,
        departureCity: departureCityData,
        arrivalCity: arrivalCityData,
      };
  
      let savedFlights = req.cookies.savedFlights ? JSON.parse(req.cookies.savedFlights) : [];
  
      savedFlights.push(savedFlight);
      res.cookie('savedFlights', JSON.stringify(savedFlights), {
        maxAge: 60 * 24 * 60 * 60 * 1000, // expires after 60 days
        httpOnly: true,
      });
  
      res.status(200).json({ message: 'Flight saved successfully' });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  };


// Delete a saved flight
export const deleteSavedFlight = async (req: Request, res: Response) => {
    try {
      const { flightNumber } = req.body;
      let savedFlights = req.cookies.savedFlights ? JSON.parse(req.cookies.savedFlights) : [];
  
      savedFlights = savedFlights.filter((flight: any) => flight.flightNumber !== flightNumber);
  
      res.cookie('savedFlights', JSON.stringify(savedFlights), { httpOnly: true, maxAge: 60 * 24 * 60 * 60 * 1000 });
      res.status(200).json(savedFlights);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  };
