import * as cheerio from "cheerio";
import axios from "axios";
import redisClient from "./redisClient.js";

const airlines = {
  "6E": "IndiGo",
  B4: "Beond",
  EK: "Emirates",
  EY: "Etihad",
  FD: "Air Asia",
  FZ: "Fly Dubai",
  GF: "Gulf Air",
  MH: "Malaysia Airlines",
  NR: "Manta Air",
  OD: "Batik Air",
  Q2: "Maldivian",
  QR: "Qatar Airways",
  SQ: "Singapore Airlines",
  SU: "Aeroflot",
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
  await deletePreviousSets(declaration, allFlights);

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
      await redisClient.ZADD(`flights:byFlight:${flight}`, {
        score: dateTime,
        value: flightKey,
      });
      await redisClient.ZADD(`flights:byCity:${city}`, {
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

const deletePreviousSets = async (allFlights) => {
  for (const flightKey of allFlights) {
    const flightData = await redisClient.HGETALL(flightKey);
    const { flight, city } = flightData;

    await redisClient.DEL(`flights:byFlight:${flight}`);
    await redisClient.DEL(`flights:byCity:${city}`);
  }
};

export default scraper;
