import * as cheerio from "cheerio";
import axios from "axios";
import redisClient from "./redisClient.js";

const airlines = {
  "3U": "Sichuan",
  "5W": "Wizz",
  "6E": "IndiGo",
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
  MF: "Xiamen Ait",
  MH: "Malaysia Airlines",
  MU: "China Eastern",
  NR: "Manta Air",
  OD: "Batik Air",
  PG: "Bangkok Airways",
  Q2: "Maldivian",
  QR: "Qatar Airways",
  SQ: "Singapore Airlines",
  SU: "Aeroflot",
  TK: "Turkish Airlines",
  UL: "Srilankan Airlines",
  VP: "Villa Air",
  WK: "Edelweiss Air",
};

const scraper = async (url, declaration) => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const table = $(
    "body > div > table > tbody > tr:nth-of-type(6) > td > table > tbody"
  );
  let currentDate = "";

  const allFlights = await redisClient.ZRANGE(
    `flights:byDeclaration:${declaration}`,
    0,
    -1
  );
  await deletePreviousSets(allFlights, declaration);

  await redisClient.DEL(`flights:byDeclaration:${declaration}`);

  table.find("tr").each(async (i, row) => {
    const isDateRow = $(row).find("tr>td.sumheadtop").length > 0;

    // Check if the row contains the date
    if (isDateRow) {
      currentDate = $(row).find("tr>td.sumheadtop").text().trim();
    }
    if ($(row).attr("valign") === "top") {
      const flight = $(row).find(".flight").text().trim();
      const city = $(row).find(".city").text().trim();
      const time = $(row).find(".time").text().trim();
      const eta = $(row).find(".estimated").text().trim();
      const status = $(row).find("div.status").text().trim();
      const flightKey = `${flight}-${i}`;
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
      await redisClient.ZADD(`flights:byFlight`, {
        score: dateTime,
        value: flightKey,
      });
      await redisClient.ZADD(`flights:byCity`, {
        score: dateTime,
        value: flightKey,
      });
      await redisClient.ZADD(`flights:byAirline`, {
        score: dateTime,
        value: flightKey,
      });
    }
  });
};

const getAirline = (flight) => {
  const flightPrefix = flight.slice(0, 2);
  return airlines[flightPrefix] || "N/A";
};

const deletePreviousSets = async (allFlights, dec) => {
  for (const flightKey of allFlights) {
    const flightData = await redisClient.HGETALL(flightKey);
    const { flight, city, declaration } = flightData;

    if (dec === declaration) {
      await redisClient.ZREM(`flights:byFlight:${flight}`, flightKey);
      await redisClient.ZREM(`flights:byCity:${city}`, flightKey);
    }
  }
};

export default scraper;
