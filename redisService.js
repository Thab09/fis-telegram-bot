import redisClient from "./redisClient.js";

//gets either all arrival or departure flights
export const getAllFlights = async (declaration) => {
  setTimeout(async () => {
    const allFlights = await redisClient.ZRANGEBYSCORE(
      `flights:byDeclaration:${declaration}`,
      "-inf",
      "+inf"
    );
    for (const flight of allFlights) {
      const flightDetails = await redisClient.HGETALL(flight);
      console.log(JSON.stringify(flightDetails, null, 2));
    }
  }, 1000);
};

export const getFlightByFlight = async (flight, declaration = null) => {
  setTimeout(async () => {
    const flightByFlight = await redisClient.ZRANGEBYSCORE(
      `flights:byFlight`,
      "-inf",
      "+inf"
    );
    for (const flightKey of flightByFlight) {
      const flightDetails = await redisClient.HGETALL(flightKey);
      if (flightDetails.flight.match(flight)) {
        if (!declaration || flightDetails.declaration === declaration) {
          console.log(JSON.stringify(flightDetails, null, 2));
        }
      }
    }
  }, 1000);
};

export const getFlightByCity = async (city, declaration = null) => {
  //City means origin for arrivals and destination for departures
  setTimeout(async () => {
    const flightByCity = await redisClient.ZRANGEBYSCORE(
      `flights:byCity`,
      "-inf",
      "+inf"
    );
    for (const flightKey of flightByCity) {
      const flightDetails = await redisClient.HGETALL(flightKey);
      if (flightDetails.city.includes(city)) {
        if (flightDetails.declaration === declaration) {
          console.log(JSON.stringify(flightDetails, null, 2));
        }
      }
    }
  }, 1000);
};

export const getFlightByAirline = async (airline, declaration = null) => {
  //City means origin for arrivals and destination for departures
  setTimeout(async () => {
    const flightByCity = await redisClient.ZRANGEBYSCORE(
      `flights:byAirline`,
      "-inf",
      "+inf"
    );
    for (const flightKey of flightByCity) {
      const flightDetails = await redisClient.HGETALL(flightKey);
      if (flightDetails.airline.includes(airline)) {
        if (flightDetails.declaration === declaration) {
          console.log(JSON.stringify(flightDetails, null, 2));
        }
      }
    }
  }, 1000);
};
