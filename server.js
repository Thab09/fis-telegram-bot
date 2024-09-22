import scraper from "./scraper.js";
import {
  getAllFlights,
  getFlightByFlight,
  getFlightByCity,
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
  // getFlightByFlight("EK 653", "Arrival");
  // getAllFlights("Arrival");
  getFlightByCity("Colombo", "Arrival");
};

main();
