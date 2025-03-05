import express from 'express';
import flightDataRouter from './routes/flightData'
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 5000;

//middleware
app.use(cors({
    origin: "http://localhost:3000", // restrict to frontend origin
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// routes
app.use('/api', flightDataRouter)

// listener
app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`)
})
