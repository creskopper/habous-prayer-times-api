import express from "express";
import { format } from "date-fns";

import { CITY_ID_ALIASES } from "../constants.js";
import {
	getMonth,
	getHijriTable,
	toHijri,
	todayInMorocco,
	listCities,
} from "../lib/habousData.js";

const PrayerTimesRoute = express.Router();

/**
 * GET /prayer-times?cityId=1
 *   Optional: month=YYYY-MM  (default: current month)
 *             date=YYYY-MM-DD (only that day; overrides month)
 */
PrayerTimesRoute.get("/prayer-times", async (req, res) => {
	const { cityId = "1", month: monthParam, date: dateParam } = req.query;

	if (typeof cityId !== "string" || !/^\d+$/.test(cityId)) {
		return res.status(400).send({ message: "cityId must be a number" });
	}

	let year, month, onlyDay;
	const today = todayInMorocco();

	if (dateParam !== undefined) {
		const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateParam));
		if (!m) {
			return res
				.status(400)
				.send({ message: "date must be in the format YYYY-MM-DD" });
		}
		[year, month, onlyDay] = [Number(m[1]), Number(m[2]), Number(m[3])];
	} else if (monthParam !== undefined) {
		const m = /^(\d{4})-(\d{2})$/.exec(String(monthParam));
		if (!m) {
			return res
				.status(400)
				.send({ message: "month must be in the format YYYY-MM" });
		}
		[year, month] = [Number(m[1]), Number(m[2])];
	} else {
		({ year, month } = today);
	}

	if (month < 1 || month > 12) {
		return res.status(400).send({ message: "Invalid month" });
	}

	try {
		const [monthData, hijriTable] = await Promise.all([
			getMonth(year, month),
			getHijriTable(),
		]);

		if (!monthData) {
			return res.status(404).send({
				message:
					"Prayer times for this month are not published on the Habous gov website",
			});
		}

		const code = CITY_ID_ALIASES[cityId] || Number(cityId);
		const ville = monthData.villes.find((v) => v.c === code);

		if (!ville) {
			return res.status(404).send({
				message: "This city id does not exist in Habous gov website",
			});
		}

		if (onlyDay !== undefined && (onlyDay < 1 || onlyDay > ville.h.length)) {
			return res.status(400).send({ message: "Invalid date" });
		}

		const [city] = listCities({ villes: [ville] });

		const timings = ville.h
			.map((times, index) => {
				const day = index + 1;
				const date = new Date(year, month - 1, day);

				return {
					date: {
						readable: format(date, "d MMM y"), // Example: 17 Sep 2023
						formatedDate: format(date, "d-MMM-y").toLowerCase(), // Example: 17-sep-2023
						iso: format(date, "yyyy-MM-dd"), // Example: 2023-09-17
						gregorian: {
							day,
							month: format(date, "MMMM"),
							year,
						},
						hijri: toHijri(hijriTable, year, month, day),
					},
					prayers: {
						fajr: times[0],
						sunrise: times[1],
						dhuhr: times[2],
						asr: times[3],
						maghrib: times[4],
						ishaa: times[5],
					},
				};
			})
			.filter(
				(timing) =>
					onlyDay === undefined || timing.date.gregorian.day === onlyDay
			);

		res.status(200).send({
			data: {
				city: {
					id: city.id,
					ar: city.arabicCityName,
					fr: city.frenshCityName,
				},
				timezone: monthData.fuseau ?? null,
				timings,
			},
		});
	} catch (error) {
		console.error("Error occurred while fetching prayers:", error.message);
		res.status(502).send({
			message: "Could not fetch prayer times from the Habous gov website",
		});
	}
});

export default PrayerTimesRoute;
