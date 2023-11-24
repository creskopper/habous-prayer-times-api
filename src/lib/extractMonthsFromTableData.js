import extractPrayerTableData from "./extractPrayerTableData.js";
import { GREGORIAN_MONTHS_ARABIC_TO_ENGLISH } from "../constants.js";

async function extractMonthsFromTableData({ cityId }) {
	const prayerTableData = await extractPrayerTableData({ cityId });

	let hijriMonth;
	let firstDay;
	let gregorianMonthsInArabic = [];
	const gregorianMonthsInEnglish = [];
	const gregorianMonthsIndexes = [];

	prayerTableData.forEach((row, index) => {
		switch (index) {
			case 0: {
				// Extracting Hijri month from the first row of data
				hijriMonth = row[1];

				// Splitting Arabic representation of Gregorian months
				gregorianMonthsInArabic = row[2].split(" / ");

				// Handling scenarios where there's one or two Gregorian months listed
				if (gregorianMonthsInArabic.length === 1) {
					// Storing the English name and index of the single Gregorian month
					gregorianMonthsInEnglish.push(
						GREGORIAN_MONTHS_ARABIC_TO_ENGLISH[
							gregorianMonthsInArabic[0]
						].name
					);

					gregorianMonthsIndexes.push(
						GREGORIAN_MONTHS_ARABIC_TO_ENGLISH[
							gregorianMonthsInArabic[0]
						].index
					);
				} else {
					// Storing the English names and indexes of two Gregorian months
					gregorianMonthsInEnglish.push(
						GREGORIAN_MONTHS_ARABIC_TO_ENGLISH[
							gregorianMonthsInArabic[0]
						].name
					);
					gregorianMonthsInEnglish.push(
						GREGORIAN_MONTHS_ARABIC_TO_ENGLISH[
							gregorianMonthsInArabic[1]
						].name
					);

					gregorianMonthsIndexes.push(
						GREGORIAN_MONTHS_ARABIC_TO_ENGLISH[
							gregorianMonthsInArabic[0]
						].index
					);
					gregorianMonthsIndexes.push(
						GREGORIAN_MONTHS_ARABIC_TO_ENGLISH[
							gregorianMonthsInArabic[1]
						].index
					);
				}

				return;
			}
			case 1: {
				// Extracting the first day from the second row of data
				firstDay = row[2];
			}

			default:
				break;
		}
	});

	return {
		firstDay,
		hijriMonth,
		gregorianMonthsInArabic,
		gregorianMonthsInEnglish,
		gregorianMonthsIndexes,
	};
}

export default extractMonthsFromTableData;
