import redisClient from "./redisClient.js";

/*
 * Function Name: getAllFlights
 * Description: Fetches all flights by declaration ('Arrival' or 'Departure') from Redis.
 * Inputs:
 *  - declaration: A string ('Arrival' or 'Departure') indicating the type of flight
 * Returns:
 *  - Array of objects (flight with details)
 */
export const getAllFlights = async (declaration) => {
  const data = [];

  // Fetching all the flights based on the declaration
  const allFlights = await redisClient.ZRANGEBYSCORE(
    `flights:byDeclaration:${declaration}`,
    "-inf",
    "+inf"
  );

  // Looping throught the list of allFlights to get the details of each flight
  for (const flight of allFlights) {
    const flightDetails = await redisClient.HGETALL(flight);
    data.push(flightDetails);
  }
  return data;
};

/*
 * Function Name: getFlightByFlight
 * Description: Fetches all flights that matches/includes the flight number from Redis.
 * Inputs:
 *  - flight: Flight number (String)
 *  - declaration: A string ('Arrival' or 'Departure') indicating the type of flight
 * Returns:
 *  - Array of objects (flights with details)
 */
export const getFlightByFlight = async (flight, declaration) => {
  const data = [];

  // Fetching all the flights based on the flight number
  const flightByFlight = await redisClient.ZRANGEBYSCORE(
    `flights:byFlight:${declaration}`,
    "-inf",
    "+inf"
  );

  // Looping throught the list of flightByFlight to get the details of each flight
  // and only adding flights that matches/includes the flight number to the array

  for (const flightKey of flightByFlight) {
    const flightDetails = await redisClient.HGETALL(flightKey);
    if (flightDetails.flight.includes(flight)) {
      data.push(flightDetails);
    }
  }
  return data;
};

/*
 * Function Name: getFlightByCity
 * Description: Fetches all flights that matches/includes the city name from Redis.
 * Inputs:
 *  - city: City name (String) - origin for arrivals and destination for departures
 *  - declaration: A string ('Arrival' or 'Departure') indicating the type of flight
 * Returns:
 *  - Array of objects (flights with details)
 */
export const getFlightByCity = async (city, declaration) => {
  const data = [];

  //Fetching all the flights based on the city name
  const flightByCity = await redisClient.ZRANGEBYSCORE(
    `flights:byCity:${declaration}`,
    "-inf",
    "+inf"
  );

  // Looping throught the list of flightByCity to get the details of each flight
  // and only adding flights that matches/includes the city name to the array
  for (const flightKey of flightByCity) {
    const flightDetails = await redisClient.HGETALL(flightKey);
    if (flightDetails.city.includes(city)) {
      data.push(flightDetails);
    }
  }
  return data;
};

/*
 * Function Name: getFlightByAirline
 * Description: Fetches all flights that matches/includes the airline name from Redis.
 * Inputs:
 *  - city: Airline name (String)
 *  - declaration: A string ('Arrival' or 'Departure') indicating the type of flight
 * Returns:
 *  - Array of objects (flights with details)
 */
export const getFlightByAirline = async (airline, declaration) => {
  const data = [];

  // Fetching all the flights based on the airline name
  const flightByAirline = await redisClient.ZRANGEBYSCORE(
    `flights:byAirline:${declaration}`,
    "-inf",
    "+inf"
  );

  // Looping throught the list of flightByAirline to get the details of each flight
  // and only adding flights that matches/includes the airline name to the array
  for (const flightKey of flightByAirline) {
    const flightDetails = await redisClient.HGETALL(flightKey);
    if (flightDetails.airline.includes(airline)) {
      data.push(flightDetails);
    }
  }
  return data;
};
