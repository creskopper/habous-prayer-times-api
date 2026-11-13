import express from "express";

import {
	getLatestMonth,
	getSavedCities,
	listCities,
} from "../lib/habousData.js";

const AvailableCitiesRoute = express.Router();

AvailableCitiesRoute.get("/available-cities", async (req, res) => {
	let cities = [];

	try {
		const monthData = await getLatestMonth();
		if (monthData) cities = listCities(monthData);
	} catch (error) {
		console.error("Could not fetch cities from Habous:", error.message);
	}

	// Habous website unreachable: fall back to the saved list.
	if (cities.length === 0) cities = getSavedCities();

	if (cities.length === 0) {
		return res.status(500).send({
			message: "Could not fetch available cities.",
		});
	}

	res.send({ cities });
});

export default AvailableCitiesRoute;
