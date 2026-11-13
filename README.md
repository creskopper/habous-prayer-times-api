# Habous Prayer Times API (unofficial)

This API provides access to API Morocco's prayer times and information about available cities from the [Habous.gov.ma](https://habous.gov.ma/) website. Please note that this API is unofficial and is not affiliated with or endorsed by the official "Ministry of Habous and Islamic Affairs".

## Overview

This API is built using **Node.js** and **Express.js** for handling HTTP requests and routing. The data is read from the static data files the Habous government website publishes (`/data/horaires-YYYY-MM.js`, one per Gregorian month, and `/data/hijri.js` for the announced Hijri month starts). Responses are cached in memory for 6 hours, and the last good copy is served if the Habous website is unreachable.

## Live API

For more information visit: **[habous-prayer-times-api.onrender.com](https://habous-prayer-times-api.onrender.com/)**

**Please note:** This API is hosted on render.com's free tier. Render occasionally spins down free web services that go 15 minutes without receiving inbound traffic. When a request is made, Render resumes the service, causing a brief delay before the API is back up and running. Users may experience this slight delay due to service reactivation.

You can access the API endpoints:

-   **Available Cities:** https://habous-prayer-times-api.onrender.com/api/v1/available-cities
-   **Prayer Times:** https://habous-prayer-times-api.onrender.com/api/v1/prayer-times

Feel free to explore and use these endpoints to fetch information about available cities and prayer times.

## Endpoints

1. [Available Cities](#1-available-cities)
2. [Prayer Times](#2-prayer-times)

### 1. Available Cities

-   **Description:** This endpoints retrieves a list of available cities on the Habous gov website
-   **Method:** `GET`
-   **Endpoint URL:** `/api/v1/available-cities`
-   **Example Request:** https://habous-prayer-times-api.onrender.com/api/v1/available-cities
-   **Example Response:**

    ```JSON
    {
        "cities": [
            {
                "id": "1",
                "arabicCityName": "الرباط",
                "frenshCityName": "Rabat"
            },
            {
                "id": "2",
                "arabicCityName": "الخميسات",
                "frenshCityName": "Khémissat"
            },
            {
                "id": "3",
                "arabicCityName": "تيفلت",
                "frenshCityName": "Tiflet"
            },
            {
                "id": "4",
                "arabicCityName": "الرماني",
                "frenshCityName": "Remani"
            },
            {
                "id": "5",
                "arabicCityName": "والماس",
                "frenshCityName": "Oualmas"
            },

            // More available cities, there are 191 cities in total
        ]
    }
    ```

### 2. Prayer Times

-   **Description:** This endpoint retrieves prayer times of the current Gregorian month for a specific city using the city's ID. If you don't know the ID for a specific city you can use the [/available-cities](#1-available-cities) route to retreive all the cities available
-   **Method:** `GET`
-   **Endpoint URL:** `/api/v1/prayer-times?cityId={cityId}`
-   **Optional parameters:**
    -   `month=YYYY-MM` returns another month, if the Habous website has published it (otherwise `404`)
    -   `date=YYYY-MM-DD` returns only that day
-   **Notes:** each timing also has `date.iso` (`YYYY-MM-DD`); `date.hijri` is `null` for days outside the Hijri months announced by the ministry; `data.timezone` is the timezone the times are published in.
-   **Example Request:** https://habous-prayer-times-api.onrender.com/api/v1/prayer-times?cityId=109
-   **Example Response:**

    ```JSON
    {
        "data": {
            "city": {
    		"ar": "الرحامنة",
    		"fr": "Rehamna"
    	},
    	"timings": [
    		{
    			"date": {
    				"readable": "15 Nov 2023",
    				"formatedDate": "15-nov-2023",
    				"gregorian": {
    					"day": 15,
    					"month": "November",
    					"year": 2023
    				},
    				"hijri": {
    					"day": 1,
    					"month": "جمادى الأولى",
    					"year": 1445
    				}
    			},
    			"prayers": {
    				"fajr": "06:31",
    				"sunrise": "07:55",
    				"dhuhr": "13:21",
    				"asr": "16:11",
    				"maghrib": "18:38",
    				"ishaa": "19:51"
    			}
    		},
            // More prayer time objects for subsequent dates
        ]
        }
    }
    ```

## Installation

-   Clone the repository.
-   Install dependencies using `npm install`.
-   Start the server with `npm start` or `npm run dev`.

## What's fixed (November 2026)

The Habous website went into maintenance mode and removed the pages this API used to scrape (`/prieres/horaire_hijri_2.php` and `/prieres/horaire_hijri_fr.php` now return `404`), so every prayer-times request failed.

-   **New data source:** prayer times are now read from the static data files the Habous website publishes (`/data/horaires-YYYY-MM.js` and `/data/hijri.js`) instead of the removed HTML pages. The files are parsed as data and never executed.
-   **Server crash fixed:** a failed request to the Habous website used to throw outside the `try/catch` and stop the whole server. Upstream errors now return `502` with a message.
-   **Correct Hijri year:** the Hijri date comes from the month starts announced by the ministry. It was hard-coded to `1445`.
-   **Caching:** data is kept in memory for 6 hours, and the last good copy is served when the Habous website is unreachable. Before, every request made several requests to the Habous website.
-   **Live city list:** `/available-cities` returns the cities currently published (190), with French names taken from `db.json`. The retired duplicate id `303` still works and maps to `94`.
-   **New options:** `month=YYYY-MM` and `date=YYYY-MM-DD` on `/prayer-times`, plus `date.iso`, `city.id` and `timezone` in the response.
-   **Input validation:** invalid `cityId`, `month` or `date` return `400` instead of an unhandled error.
-   **Docs page path:** the static docs page was not served when the project folder path contained a space.
-   **Dependencies:** `cheerio` and `lowdb` are no longer needed and were removed.

**Behaviour change:** `/prayer-times` now returns a Gregorian month instead of a Hijri month, because that is how the Habous website publishes the data now.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
