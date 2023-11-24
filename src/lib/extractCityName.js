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

async function extractCityName({ cityId }) {
	const [ArResponse, FrResponse] = await Promise.all([
		axios.get(`${HABOUS_AR_PRAYER_TIMES_URL}?ville=${cityId}`, {
			httpsAgent,
		}),
		axios.get(`${HABOUS_FR_PRAYER_TIMES_URL}?ville=${cityId}`, {
			httpsAgent,
		}),
	]);

	const $Ar = cheerio.load(ArResponse.data);
	const $Fr = cheerio.load(FrResponse.data);

	const cityNameInArabic = $Ar(
		"select[name='ville'] option[selected='selected']"
	).text();
	const cityNameInFrensh = $Fr(
		"select[name='ville'] option[selected='selected']"
	).text();

	return { cityNameInArabic, cityNameInFrensh };
}

export default extractCityName;
