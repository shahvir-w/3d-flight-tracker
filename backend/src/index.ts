import express from 'express';
import flightnumsRouter from './routes/flightNums'
import cors from "cors";

const app = express();
const PORT = 5000;

//middleware
app.use(cors({
    origin: "http://localhost:3000", // restrict to frontend origin
    credentials: true // allow cookies
  }));

// routes
app.use('/api/flights', flightnumsRouter)

// listener
app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`)
})
