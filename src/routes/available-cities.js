import express from "express";

import { JSONPreset } from "lowdb/node";

const AvailableCitiesRoute = express.Router();

AvailableCitiesRoute.get("/available-cities", async (req, res) => {
	const db = await JSONPreset("db.json", {});
	const cities = db.data.cities;

	if (cities.length === 0) {
		return res.status(500).send({
			message: "Could not fetch available cities.",
		});
	}

	res.send({ cities });
});

export default AvailableCitiesRoute;
