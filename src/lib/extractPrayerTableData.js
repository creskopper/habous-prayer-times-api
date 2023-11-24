import axios from "axios";
import https from "https";
import * as cheerio from "cheerio";

import { HABOUS_AR_PRAYER_TIMES_URL } from "../constants.js";

const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
});

async function extractPrayerTableData({ cityId }) {
	const response = await axios.get(
		`${HABOUS_AR_PRAYER_TIMES_URL}?ville=${cityId}`,
		{
			httpsAgent,
		}
	);

	const $ = cheerio.load(response.data);
	const table = $("table#horaire");
	const tableData = [];

	table.find("tr").each((i, row) => {
		const rowData = [];

		$(row)
			.find("td")
			.each((k, cell) => {
				rowData.push($(cell).text().trim());
			});

		tableData.push(rowData);
	});

	return tableData;
}

export default extractPrayerTableData;
