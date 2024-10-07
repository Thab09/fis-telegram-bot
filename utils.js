import RedisStore from "./RedisStore.js";
import redisClient from "./redisClient.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Function Name: generateFlightFile
 * Description: Generates a csv file using the data recieved
 * Inputs:
 *  - flights: An array of objects(each object is a flight with details)
 *  - declaration: A string ('Arrival' or 'Departure') indicating the type of flight
 *  - filename: A string that the file will be named after
 * Returns:
 *  - A csv file
 */
export const generateFlightFile = (flights, declaration, filename) => {
  const filePath = path.join(__dirname, `${filename}.csv`);
  const city = declaration === "Arrival" ? "ORIGIN" : "DESTINATION";
  const header = `DATE, AIRLINE, FLIGHT NO., ${city}, TIME, EST, STATUS\n`;
  const data = flights
    .map((flight) => {
      const date = formatDateCsv(flight.currentDate);
      return `${date},${flight.airline}, ${flight.flight}, ${flight.city}, ${flight.time}, ${flight.eta}, ${flight.status}`;
    })
    .join("\n");

  fs.writeFileSync(filePath, header + data, "utf8");

  return filePath;
};

/**
 * Function Name: formatDateCsv
 * Description: Formats the date for the csv file
 * Inputs:
 *  - currentDate: date
 * Returns:
 *  - A date in the format of (DD Mon YYYY)
 */
const formatDateCsv = (currentDate) => {
  // Convert the string to a Date object if it's not already a Date
  const dateObj = new Date(currentDate);

  // Check if the conversion resulted in an invalid Date
  if (isNaN(dateObj)) {
    throw new Error("Invalid date format");
  }

  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formattedDate}`;
};

/**
 * Function Name: formatDate
 * Description: Formats the date for telegram message (excluding files)
 * Inputs:
 *  - currentDate: date
 * Returns:
 *  - A date in the format of (DD Mon YYYY, Day)
 */
export const formatDate = (currentDate) => {
  // Convert the string to a Date object if it's not already a Date
  const dateObj = new Date(currentDate);

  // Check if the conversion resulted in an invalid Date
  if (isNaN(dateObj)) {
    throw new Error("Invalid date format");
  }

  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Get the day of the week
  const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" });

  return `${formattedDate}, ${dayOfWeek}`;
};

/**
 * Function Name: toTitleCase
 * Description: Converts the string into title case (First letter of each word capitalised)
 * Inputs:
 *  - currentDate: date
 * Returns:
 *  - A date in the format of (DD Mon YYYY, Day)
 */
export const toTitleCase = (text) => {
  return text
    .toLowerCase()
    .split(/(\s|\/)+/) // Split by spaces or slashes, keeping the separator
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(""); // Join back without altering the separators
};

/**
 * Function Name: formatFlightCode
 * Description: Formats the flight code into two parts.
 *              part one: First two characters capitalised
 *              part two: The rest of the characters
 * Inputs:
 *  - flightCode: string
 * Returns:
 *  - Flight code formatted (XX XXXX)
 */
export const formatFlightCode = (flightCode) => {
  // Remove any existing spaces and convert to uppercase
  const cleanCode = flightCode.replace(/\s+/g, "").toUpperCase();

  // Match the first two alphanumeric characters and the rest
  const match = cleanCode.match(/^([A-Z0-9]{2})(.+)$/);

  if (match) {
    // If there's a match, return the formatted string
    return `${match[1]} ${match[2]}`;
  } else {
    // If the input doesn't match the expected pattern, return it as is
    return cleanCode;
  }
};

/**
 * Function Name: rateLimitConfig
 * Description: Limits the user from requesting more than 3 times in a minute
 */
export const rateLimitConfig = {
  window: 60 * 1000, // 1 minute window
  limit: 3, // 5 requests per minute
  onLimitExceeded: (ctx) =>
    ctx.reply("You are sending requests too quickly. Please wait a minute."),
  keyGenerator: (ctx) => ctx.from.id, // Limit by user ID
  store: new RedisStore(redisClient),
};
