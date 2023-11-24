import express, { json } from "express";

import AvailableCitiesRoute from "./routes/available-cities.js";

const app = express();

app.use(json());

app.use("/api/v1/", AvailableCitiesRoute);

app.get("/", (req, res) => {
	res.send({
		message: "ok",
	});
});

export default app;
