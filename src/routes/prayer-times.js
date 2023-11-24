import express from "express";
import { addDays, format, getYear } from "date-fns";

import extractCityName from "../lib/extractCityName.js";
import extractPrayerTableData from "../lib/extractPrayerTableData.js";
import extractMonthsFromTableData from "../lib/extractMonthsFromTableData.js";

const PrayerTimesRoute = express.Router();

PrayerTimesRoute.get("/prayer-times", async (req, res) => {
	const { cityId = 1 } = req.query;

	try {
		const [{ cityNameInArabic, cityNameInFrensh }, prayers] =
			await Promise.all([
				extractCityName({
					cityId,
				}),
				getPrayers({ cityId }),
			]);

		res.status(200).send({
			data: {
				city: {
					ar: cityNameInArabic,
					fr: cityNameInFrensh,
				},
				timings: prayers,
			},
		});
	} catch (error) {
		res.status(500).send({
			message: "Request could not be fulfilled",
		});
	}
});

async function getPrayers({ cityId }) {
	try {
		const [
			prayerTableData,
			{ firstDay, hijriMonth, gregorianMonthsIndexes },
		] = await Promise.all([
			extractPrayerTableData({ cityId }),
			extractMonthsFromTableData({ cityId }),
		]);

		const prayers = [];
		let date;

		prayerTableData.forEach((row, index) => {
			// Skip first row as it only contains table head
			if (index === 0) return;

			const year = Number(format(new Date(), "y"));
			const monthIndex = Number(gregorianMonthsIndexes[0]);
			const day = Number(firstDay);
			const firstDate = new Date(year, monthIndex, day);

			date = addDays(firstDate, index - 1);

			const readableDate = format(date, "d MMM y"); // Example: 17 Sep 2023
			const formatedDate = format(date, "d-MMM-y").toLowerCase(); // Example: 17-sep-2023

			prayers.push({
				date: {
					readable: readableDate,
					formatedDate: formatedDate,
					gregorian: {
						day: Number(row[2]),
						month: format(date, "MMMM"),
						year: getYear(date),
					},
					hijri: {
						day: Number(row[1]) || row[1],
						month: hijriMonth,
						year: 1445, //TODO: extract Hijri year from Habous website
					},
				},
				prayers: {
					fajr: row[3],
					sunrise: row[4],
					dhuhr: row[5],
					asr: row[6],
					maghrib: row[7],
					ishaa: row[8],
				},
			});
		});

		return prayers;
	} catch (error) {
		console.error("Error occurred while fetching prayers:", error);
		throw error;
	}
}

export default PrayerTimesRoute;
