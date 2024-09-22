import redisClient from "./redisClient.js";

//gets either all arrival or departure flights
export const getAllFlights = async (declaration) => {
  setTimeout(async () => {
    const allFlights = await redisClient.ZRANGEBYSCORE(
      `flights:byDeclaration:${declaration}`,
      "-inf",
      "+inf"
    );
    console.log(allFlights);

    for (const flight of allFlights) {
      const flightDetails = await redisClient.HGETALL(flight);
      // console.log(JSON.stringify(flightDetails, null, 2));
    }
  }, 1000); // 1 second delay to allow data insertion
};

export const getFlightByFlight = async (flight, declaration = null) => {
  setTimeout(async () => {
    const flightByFlight = await redisClient.ZRANGEBYSCORE(
      `flights:byFlight:${flight}`,
      "-inf",
      "+inf"
    );
    console.log(flightByFlight);
    for (const flightKey of flightByFlight) {
      const flightDetails = await redisClient.HGETALL(flightKey);
      if (!declaration || flightDetails.declaration === declaration) {
        //   console.log(JSON.stringify(flightDetails, null, 2));
      }
    }
  }, 1000); // 1 second delay to allow data insertion
};

export const getFlightByCity = async (city, declaration = null) => {
  //City means origin for arrivals and destination for departures
  setTimeout(async () => {
    const flightByCity = await redisClient.ZRANGEBYSCORE(
      `flights:byCity:${city}`,
      "-inf",
      "+inf"
    );

    console.log(flightByCity);
    for (const flightKey of flightByCity) {
      const flightDetails = await redisClient.HGETALL(flightKey);
      if (!declaration || flightDetails.declaration === declaration) {
        //   console.log(JSON.stringify(flightDetails, null, 2));
      }
    }
  }, 1000); // 1 second delay to allow data insertion
};
