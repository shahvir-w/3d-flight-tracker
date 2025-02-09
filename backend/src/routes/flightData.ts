import { Router } from "express";
import { getFlightData, getSavedFlight, addSavedFlight } from "../controllers/flightData";

const router = Router();

router.get('/:flightNum', getFlightData);

router.get('/saved', getSavedFlight)

router.post('/saved/:flightNum', addSavedFlight)

export default router;
