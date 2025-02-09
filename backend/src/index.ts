import express from 'express';
import flightDataRouter from './routes/flightData'
import cors from "cors";

const app = express();
const PORT = 5000;

//middleware
app.use(cors({
    origin: "http://localhost:3000", // restrict to frontend origin
    credentials: true // allow cookies
  }));

// routes
app.use('/api/flights', flightDataRouter)

// listener
app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`)
})
