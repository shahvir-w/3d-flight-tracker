import express from "express";
import cors from "cors";
import rateLimit from 'express-rate-limit';
import flightDataRoutes from "./routes/flightData";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3001;

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true, 
};

app.use(cors(corsOptions));

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes',
    status: 429
  },
  // Skip rate limiting for OPTIONS requests (CORS preflight)
  skip: (req) => req.method === 'OPTIONS'
});

// Apply rate limiting after CORS
app.use(limiter);

app.use(express.json());

// Routes
app.use('/api/flights', flightDataRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
