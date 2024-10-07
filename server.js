import scraper from "./scraper.js";
import "./telegramBot.js";

/*
 * Fucntion name: scrapeFlightData
 * Description: Calls the scraper function twice.
 *              Once for Arrivals. Once for Departures.
 */
const scrapeFlightData = async () => {
  await scraper(process.env.ARRIVALS_URL, "Arrival");
  await scraper(process.env.DEPARTURES_URL, "Departure");
};

const main = async () => {
  setInterval(async () => {
    await scrapeFlightData();
  }, 300000);
};

main();
