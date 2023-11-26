import express, { json } from "express";
import path from "path";
import cors from "cors";

import AvailableCitiesRoute from "./routes/available-cities.js";
import PrayerTimesRoute from "./routes/prayer-times.js";
import saveCities from "./lib/saveCities.js";

const app = express();

const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(cors());
app.use(json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/", AvailableCitiesRoute);
app.use("/api/v1/", PrayerTimesRoute);

// saveCities(); // TODO: add a cron job to fetch available cities in case there's a change

export default app;
