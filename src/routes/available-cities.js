import express from "express";

import extractCities from "../lib/extractCities.js";

const AvailableCitiesRoute = express.Router();

AvailableCitiesRoute.get("/available-cities", async (req, res) => {
	const cities = await extractCities();

	if (cities.length === 0) {
		return res.status(500).send({
			message: "Could not fetch available cities.",
		});
	}

	res.send({ cities });
});

export default AvailableCitiesRoute;
