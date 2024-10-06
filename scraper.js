import * as cheerio from "cheerio";
import axios from "axios";
import redisClient from "./redisClient.js";

const airlines = {
  "3U": "Sichuan Airlines",
  "5W": "Wizz Airlines",
  "6E": "IndiGo Airlines",
  "8D": "Fits Air",
  AK: "Air Asia",
  B4: "Beond",
  BS: "US Bangla Airlines",
  DE: "Condor",
  EK: "Emirates",
  EY: "Etihad",
  FD: "Air Asia",
  FZ: "Fly Dubai",
  GF: "Gulf Air",
  JD: "Beijing Capital",
  MF: "Xiamen Ait",
  MH: "Malaysia Airlines",
  MU: "China Eastern",
  NO: "Neos",
  NR: "Manta Air",
  OD: "Batik Air",
  PG: "Bangkok Airways",
  Q2: "Maldivian",
  QR: "Qatar Airways",
  SQ: "Singapore Airlines",
  SU: "Aeroflot",
  SV: "Saudia",
  TK: "Turkish Airlines",
  UK: "Vistara",
  UL: "Srilankan Airlines",
  VP: "Villa Air",
  WK: "Edelweiss Air",
};

/**
 * Function Name: scraper
 * Description: Fetches flight data from the given URL based on flight type (Arrival/Departure).
 * Inputs:
 *  - url: A string representing the target URL to scrape
 *  - declaration: A string ('Arrival' or 'Departure') indicating the type of flight
 * Returns:
 *  - None (The data is processed and stored in Redis)
 */
const scraper = async (url, declaration) => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const table = $(
    "body > div > table > tbody > tr:nth-of-type(6) > td > table > tbody"
  );
  let currentDate = "";
  // Get all flight keys for the current declaration
  const allFlights = await redisClient.ZRANGE(
    `flights:byDeclaration:${declaration}`,
    0,
    -1
  );
  // Delete previous sets for the current declaration
  await deletePreviousSets(allFlights, declaration);

  // Clear the declaration set
  await redisClient.DEL(`flights:byDeclaration:${declaration}`);

  for (const row of table.find("tr").toArray()) {
    const isDateRow = $(row).find("tr>td.sumheadtop").length > 0;

    // Check if the row contains the date
    if (isDateRow) {
      currentDate = $(row).find("tr>td.sumheadtop").text().trim();
      continue;
    }
    if ($(row).attr("valign") === "top") {
      const flight = $(row).find(".flight").text().trim();
      const city = $(row).find(".city").text().trim();
      const time = $(row).find(".time").text().trim();
      const eta = $(row).find(".estimated").text().trim();
      const status = $(row).find("div.status").text().trim();
      const flightKey = `${declaration}:${flight}:${currentDate}:${time}`;
      const airline = getAirline(flight);
      const dateTime = new Date(`${currentDate} ${time}`).getTime() / 1000;

      await redisClient.hSet(flightKey, {
        declaration,
        currentDate,
        airline,
        flight,
        city,
        time,
        eta,
        status,
      });
      await redisClient.ZADD(`flights:byDeclaration:${declaration}`, {
        score: dateTime,
        value: flightKey,
      });
      await redisClient.ZADD(`flights:byFlight:${declaration}`, {
        score: dateTime,
        value: flightKey,
      });
      await redisClient.ZADD(`flights:byCity:${declaration}`, {
        score: dateTime,
        value: flightKey,
      });
      await redisClient.ZADD(`flights:byAirline:${declaration}`, {
        score: dateTime,
        value: flightKey,
      });
    }
  }
};

/**
 * Function Name: getAirline
 * Description: Fetches the airline name by taking the first two characters of the flight number
 *              and matching them to the airline name using the airline object.
 * Inputs:
 *  - flight: A string representing the flight number
 * Returns:
 *  - Airline name that the flight represents
 */
const getAirline = (flight) => {
  const flightPrefix = flight.slice(0, 2);
  return airlines[flightPrefix] || "N/A";
};

/**
 * Function Name: deletePreviousSets
 * Description: Deletes the sets that were stored to Redis in the previous scraping iteration.
 * Inputs:
 *  - allFlights: A list of flights by declaration ('Arrival' or 'Departure')
 *  - declaration: A string ('Arrival' or 'Departure') indicating the type of flight
 * Returns:
 *  - None (All the matching data will be deleted)
 */
const deletePreviousSets = async (allFlights, declaration) => {
  for (const flightKey of allFlights) {
    await redisClient.ZREM(`flights:byFlight:${declaration}`, flightKey);
    await redisClient.ZREM(`flights:byCity:${declaration}`, flightKey);
    await redisClient.ZREM(`flights:byAirline:${declaration}`, flightKey);
    await redisClient.DEL(flightKey);
  }
};

export default scraper;
