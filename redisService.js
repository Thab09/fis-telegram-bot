import redisClient from "./redisClient.js";

//gets either all arrival or departure flights
export const getAllFlights = async (declaration) => {
  const data = [];
  const allFlights = await redisClient.ZRANGEBYSCORE(
    `flights:byDeclaration:${declaration}`,
    "-inf",
    "+inf"
  );
  for (const flight of allFlights) {
    const flightDetails = await redisClient.HGETALL(flight);
    data.push(flightDetails);
  }
  return data;
};

export const getFlightByFlight = async (flight, declaration) => {
  const data = [];
  const flightByFlight = await redisClient.ZRANGEBYSCORE(
    `flights:byFlight:${declaration}`,
    "-inf",
    "+inf"
  );
  for (const flightKey of flightByFlight) {
    const flightDetails = await redisClient.HGETALL(flightKey);
    if (flightDetails.flight.match(flight)) {
      data.push(flightDetails);
    }
  }

  return data;
};

export const getFlightByCity = async (city, declaration) => {
  //City means origin for arrivals and destination for departures
  const data = [];
  const flightByCity = await redisClient.ZRANGEBYSCORE(
    `flights:byCity:${declaration}`,
    "-inf",
    "+inf"
  );
  for (const flightKey of flightByCity) {
    const flightDetails = await redisClient.HGETALL(flightKey);
    if (flightDetails.city.includes(city)) {
      data.push(flightDetails);
    }
  }
  return data;
};

export const getFlightByAirline = async (airline, declaration) => {
  const data = [];
  const flightByAirline = await redisClient.ZRANGEBYSCORE(
    `flights:byAirline:${declaration}`,
    "-inf",
    "+inf"
  );
  for (const flightKey of flightByAirline) {
    const flightDetails = await redisClient.HGETALL(flightKey);
    if (flightDetails.airline.includes(airline)) {
      data.push(flightDetails);
    }
  }
  return data;
};
