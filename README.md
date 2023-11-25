# Habous Prayer Times API (unofficial)

This API provides access to API Morocco's prayer times and information about available cities from the [Habous.gov.ma](https://habous.gov.ma/) website. Please note that this API is unofficial and is not affiliated with or endorsed by the official "Ministry of Habous and Islamic Affairs".

## Overview

This API is built using **Node.js** and **Express.js** for handling HTTP requests and routing. The data is scraped from the Habous government website using **Cheerio**, a web scraping library for Node.js.

## Live API

This API is live and hosted on `render.com` for free.

-   **Note:** Render spins down a Free web service that goes 15 minutes without receiving inbound traffic. Render spins the service back up whenever it next receives a request to process. Spinning up a service takes a few seconds, which causes a noticeable delay for incoming requests until the service is back up and running.

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

-   **Description:** This endpoint retrieves prayer times of the current Hijri month for a specific city using the city's ID. If you don't know the ID for a specific city you can use the [/available-cities](#1-available-cities) route to retreive all the cities available
-   **Method:** `GET`
-   **Endpoint URL:** `/api/v1/prayer-times?cityId={cityId}`
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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
