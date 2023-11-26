import { JSONPreset } from "lowdb/node";

import extractCities from "./extractCities.js";

async function saveCities() {
	try {
		const db = await JSONPreset("db.json", {});
		const scrappedCities = await extractCities();
		const dbCities = db.data.cities || [];

		if (
			scrappedCities.length === 0 ||
			scrappedCities.length === dbCities.length
		) {
			return;
		}

		db.data.cities = scrappedCities;

		await db.write();
	} catch (error) {
		console.log(error);
	}
}

export default saveCities;
