import { Router } from "express";
import { getFlightData, getSavedFlight, addSavedFlight, deleteSavedFlight } from "../controllers/flightData";

const router = Router();

router.get('/:flightNum', getFlightData);

router.get('/saved/flights', getSavedFlight)

router.post('/saved/flights', addSavedFlight)

router.delete('/saved/flights', deleteSavedFlight)

export default router;
