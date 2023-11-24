import axios from "axios";
import https from "https";
import * as cheerio from "cheerio";

import {
	HABOUS_AR_PRAYER_TIMES_URL,
	HABOUS_FR_PRAYER_TIMES_URL,
} from "../constants.js";

const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
});

async function extractCities() {
	const [arabicHtmlResponse, frenshHtmlResponse] = await Promise.all([
		axios.get(HABOUS_AR_PRAYER_TIMES_URL, {
			httpsAgent,
		}),
		axios.get(HABOUS_FR_PRAYER_TIMES_URL, {
			httpsAgent,
		}),
	]);

	const $ar = cheerio.load(arabicHtmlResponse.data);
	const $fr = cheerio.load(frenshHtmlResponse.data);
	const arSelect = $ar("select[name='ville']");
	const frSelect = $fr("select[name='ville']");
	const cities = [];

	arSelect.find("option").each((i, option) => {
		const value = $ar(option).attr("value");
		const id = value.replace("horaire_hijri_2.php?ville=", "");
		const arabicCityName = $ar(option).text().trim();

		cities.push({
			id,
			arabicCityName,
		});
	});

	frSelect.find("option").each((i, option) => {
		const value = $fr(option).attr("value");
		const id = value.replace("horaire_hijri_fr.php?ville=", "");
		const frenshCityName = $fr(option).text().trim();

		const [city] = cities.filter((city) => city.id === id);

		city.frenshCityName = frenshCityName;
	});

	return cities;
}

export default extractCities;
