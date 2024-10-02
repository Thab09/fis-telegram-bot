import scraper from "./scraper.js";
import "./telegramBot.js";
import {
  getAllFlights,
  getFlightByFlight,
  getFlightByCity,
  getFlightByAirline,
} from "./redisService.js";

const scrapeFlightData = async () => {
  await scraper(
    "https://www.fis.com.mv/index.php?webfids_type=arrivals&webfids_lang=1",
    "Arrival"
  );
  await scraper(
    "https://www.fis.com.mv/index.php?webfids_type=departures&webfids_lang=1",
    "Departure"
  );
};

const main = async () => {
  // setInterval(async () => {
  await scrapeFlightData();
  // }, 300000);
  // getAllFlights("Arrival");
  // getFlightByFlight("EY 278", "Arrival");
  // getFlightByCity("Gan", "Arrival");
  // getFlightByAirline("Etihad", "Arrival");
};

main();

/*
- GIVE THE USERS OPTION FOR THE 3 DAYS IN SCENES 
- GIVE ONLY DATA FOR THE SPECIFIC DAY (NOT 3 DAYS)
*/
