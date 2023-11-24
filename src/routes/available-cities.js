import express from "express";
import axios from "axios";
import https from "https";
import * as cheerio from "cheerio";

import { HABOUS_AR_PRAYER_TIMES_URL } from "../constants.js";

const AvailableCitiesRoute = express.Router();

const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
});

async function extractCities() {
	const ArHtmlResponse = await axios.get(HABOUS_AR_PRAYER_TIMES_URL, {
		httpsAgent,
	});

	const $ = cheerio.load(ArHtmlResponse.data);
	const select = $("select[name='ville']");
	const cities = [];

	select.find("option").each((i, option) => {
		const value = $(option).attr("value");
		const id = value.replace("horaire_hijri_2.php?ville=", "");
		const ArCityName = $(option).text().trim();

		cities.push({
			id,
			ArCityName,
		});
	});

	return cities;
}

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
