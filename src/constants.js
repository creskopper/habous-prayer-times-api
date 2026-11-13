// The Habous website now publishes prayer times as static data files
// (one file per Gregorian month) instead of the old PHP pages.
export const HABOUS_BASE_URL = "https://www.habous.gov.ma";
export const HABOUS_MONTH_FILE = (year, month) =>
	`/data/horaires-${year}-${String(month).padStart(2, "0")}.js`;
export const HABOUS_HIJRI_FILE = "/data/hijri.js";

// How long fetched data is reused before asking the Habous website again.
export const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
// How long a "this month is not published yet" answer is remembered.
export const MISSING_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const REQUEST_TIMEOUT_MS = 30 * 1000;

// City codes the Habous website retired because they were duplicates:
// old code -> code that was kept.
export const CITY_ID_ALIASES = { 303: 94 };

// Used only if the names cannot be read from the Habous hijri file.
export const HIJRI_MONTH_NAMES = [
	"محرم",
	"صفر",
	"ربيع الأول",
	"ربيع الآخر",
	"جمادى الأولى",
	"جمادى الآخرة",
	"رجب",
	"شعبان",
	"رمضان",
	"شوال",
	"ذي القعدة",
	"ذي الحجة",
];
