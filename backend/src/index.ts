import express from "express";
import cors from "cors";
import flightDataRoutes from "./routes/flightData";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/flights', flightDataRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
