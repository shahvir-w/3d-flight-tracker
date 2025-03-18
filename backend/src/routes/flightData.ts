import { Router } from "express";
import { getFlightData } from "../controllers/flightData";

const router = Router();

router.get('/:flightNum', getFlightData);

export default router;
