import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

const GeoCoding_URL: string = 'https://maps.googleapis.com/maps/api/geocode/json';
const API_KEY = process.env.GEO_API_KEY;
console.log(API_KEY)

const getGeoLocationData = async (address: string | null): Promise<any | null> => {
  
  if (!API_KEY) {
    console.error('Missing API key for Google Geocoding API');
    return null;
  }

  try {
    const response = await axios.get<any>(GeoCoding_URL, {
      params: {
        address: address,
        key: API_KEY,
      },
    });

    if (response.data.status !== 'OK' || !response.data.results.length) {
      console.error('No results found or invalid status:', response.data.status);
      return null;
    }

    const location = response.data.results[0]?.geometry?.location;

    return {
      lat: location.lat,
      lng: location.lng,
    };

  } catch (error) {
    console.error('Error fetching geocoding location data:', error);
    return null;
  }
};

export default getGeoLocationData;
