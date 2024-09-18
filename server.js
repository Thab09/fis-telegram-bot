import scraper from "./scraper.js";

const arrivals = async () => {
  scraper('https://www.fis.com.mv/index.php?webfids_type=arrivals&webfids_lang=1', "arrival");
}
const departures = async () => {
  scraper('https://www.fis.com.mv/index.php?webfids_type=departures&webfids_lang=1', 'departure');
}
const main  = async () => {
  arrivals();
  departures();
}

main();
