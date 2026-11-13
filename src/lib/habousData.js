import axios from "axios";
import https from "https";
import { readFileSync } from "fs";

import {
	HABOUS_BASE_URL,
	HABOUS_MONTH_FILE,
	HABOUS_HIJRI_FILE,
	CACHE_TTL_MS,
	MISSING_TTL_MS,
	REQUEST_TIMEOUT_MS,
	HIJRI_MONTH_NAMES,
} from "../constants.js";

// The Habous server does not send its full certificate chain, so Node cannot
// verify it. Same workaround as the original project; only used for this host.
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const cache = new Map(); // key -> { value, expiresAt }
const pending = new Map(); // key -> Promise

/**
 * Returns the cached value for `key`, refreshing it with `loader` when it is
 * older than its TTL. If the refresh fails and an older value exists, the
 * older value is served instead of failing the request.
 */
async function cached(key, loader) {
	const entry = cache.get(key);
	if (entry && entry.expiresAt > Date.now()) return entry.value;
	if (pending.has(key)) return pending.get(key);

	const promise = (async () => {
		try {
			const value = await loader();
			const ttl = value === null ? MISSING_TTL_MS : CACHE_TTL_MS;
			cache.set(key, { value, expiresAt: Date.now() + ttl });
			return value;
		} catch (error) {
			if (entry && entry.value !== null) {
				console.error(
					`Habous fetch failed for ${key}, serving cached copy:`,
					error.message
				);
				return entry.value;
			}
			throw error;
		} finally {
			pending.delete(key);
		}
	})();

	pending.set(key, promise);
	return promise;
}

/** Fetches a file from the Habous website as text. Returns null on 404. */
async function fetchText(path) {
	const response = await axios.get(`${HABOUS_BASE_URL}${path}`, {
		httpsAgent,
		timeout: REQUEST_TIMEOUT_MS,
		responseType: "text",
		transformResponse: (body) => body,
		validateStatus: (status) => status === 200 || status === 404,
	});

	return response.status === 404 ? null : response.data;
}

/**
 * A month file looks like:
 *   (window.HORAIRES_MOIS=window.HORAIRES_MOIS||[]).push({ ...JSON... });
 * The JSON part is extracted and parsed; the file is never executed.
 */
function parseMonthFile(text) {
	const start = text.indexOf(".push(");
	const end = text.lastIndexOf(")");
	if (start === -1 || end <= start) {
		throw new Error("Unexpected Habous month file format");
	}

	const data = JSON.parse(text.slice(start + ".push(".length, end));
	if (!Array.isArray(data.villes) || data.villes.length === 0) {
		throw new Error("Habous month file has no cities");
	}

	return data;
}

/**
 * The hijri file is a JS object literal listing the announced start of each
 * Hijri month. Entries are read with a pattern; the file is never executed.
 */
function parseHijriFile(text) {
	const months = [];
	const entry =
		/\{\s*debut:\s*'(\d{4})-(\d{2})-(\d{2})'\s*,\s*mois:\s*(\d+)\s*,\s*annee:\s*(\d+)\s*,\s*duree:\s*(null|\d+)\s*\}/g;

	for (const m of text.matchAll(entry)) {
		months.push({
			startUtc: Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])),
			month: Number(m[4]),
			year: Number(m[5]),
			length: m[6] === "null" ? null : Number(m[6]),
		});
	}

	let names = HIJRI_MONTH_NAMES;
	const namesBlock = /noms:\s*\[([^\]]*)\]/.exec(text);
	if (namesBlock) {
		const found = [...namesBlock[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
		if (found.length === 12) names = found;
	}

	months.sort((a, b) => a.startUtc - b.startUtc);
	return { names, months };
}

/**
 * Prayer times of every city for one Gregorian month, or null when the
 * Habous website has not published that month.
 */
export function getMonth(year, month) {
	return cached(`month:${year}-${month}`, async () => {
		const text = await fetchText(HABOUS_MONTH_FILE(year, month));
		return text === null ? null : parseMonthFile(text);
	});
}

/** Announced Hijri month starts. Empty table if the file is unavailable. */
export async function getHijriTable() {
	try {
		const table = await cached("hijri", async () => {
			const text = await fetchText(HABOUS_HIJRI_FILE);
			return text === null ? null : parseHijriFile(text);
		});
		return table || { names: HIJRI_MONTH_NAMES, months: [] };
	} catch (error) {
		console.error("Could not load Habous hijri table:", error.message);
		return { names: HIJRI_MONTH_NAMES, months: [] };
	}
}

/**
 * Hijri date of a Gregorian day, based only on the month starts announced by
 * the ministry (no astronomical calculation). Returns null when the day is
 * outside the announced months.
 */
export function toHijri(table, year, month, day) {
	const t = Date.UTC(year, month - 1, day);

	for (let i = table.months.length - 1; i >= 0; i--) {
		const entry = table.months[i];
		const n = Math.round((t - entry.startUtc) / 86400000) + 1;
		if (n < 1) continue;
		if (n > (entry.length || 30)) return null;

		const hijri = {
			day: n,
			month: table.names[entry.month - 1],
			year: entry.year,
		};
		// 30th day of a month whose length has not been announced yet
		if (entry.length === null && n === 30) hijri.uncertain = true;
		return hijri;
	}

	return null;
}

/** Current date in Morocco. The Habous data is published in GMT. */
export function todayInMorocco() {
	const now = new Date();
	return {
		year: now.getUTCFullYear(),
		month: now.getUTCMonth() + 1,
		day: now.getUTCDate(),
	};
}

/**
 * The current month's data, or the previous month's when the current one is
 * not published yet. Returns null if neither is available.
 */
export async function getLatestMonth() {
	const { year, month } = todayInMorocco();
	const current = await getMonth(year, month);
	if (current) return current;

	const previous = month === 1 ? [year - 1, 12] : [year, month - 1];
	return getMonth(previous[0], previous[1]);
}

// French city names are not in the new Habous data; they come from the list
// saved in db.json by the original scraper.
let savedCities;
export function getSavedCities() {
	if (!savedCities) {
		try {
			const file = new URL("../../db.json", import.meta.url);
			savedCities = JSON.parse(readFileSync(file, "utf8")).cities || [];
		} catch (error) {
			console.error("Could not read db.json:", error.message);
			savedCities = [];
		}
	}
	return savedCities;
}

/** Cities currently published by the Habous website, with French names. */
export function listCities(monthData) {
	const frenchById = new Map(
		getSavedCities().map((city) => [city.id, city.frenshCityName])
	);

	return monthData.villes.map((ville) => ({
		id: String(ville.c),
		arabicCityName: ville.n,
		frenshCityName: frenchById.get(String(ville.c)) ?? null,
	}));
}
