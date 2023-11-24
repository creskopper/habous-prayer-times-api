import express, { json } from "express";

import AvailableCitiesRoute from "./routes/available-cities.js";
import PrayerTimesRoute from "./routes/prayer-times.js";

const app = express();

app.use(json());

app.use("/api/v1/", AvailableCitiesRoute);
app.use("/api/v1/", PrayerTimesRoute);

app.get("/", (req, res) => {
	res.send({
		message: "ok",
	});
});

export default app;
