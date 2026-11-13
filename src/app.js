import express, { json } from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import AvailableCitiesRoute from "./routes/available-cities.js";
import PrayerTimesRoute from "./routes/prayer-times.js";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/", AvailableCitiesRoute);
app.use("/api/v1/", PrayerTimesRoute);

export default app;
