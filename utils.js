import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate a text file with flight data
export const generateFlightFile = (flights, declaration, filename) => {
  const filePath = path.join(__dirname, `${filename}.csv`);
  const city = declaration === "Arrival" ? "ORIGIN" : "DESTINATION";
  const header = `DATE, AIRLINE, FLIGHT NO., ${city}, TIME, EST, STATUS\n`;
  const data = flights
    .map((flight) => {
      const date = formatDateCsv(flight.currentDate);
      return `${date},${flight.airline}, ${flight.flight}, ${flight.city}, ${flight.time}, ${flight.eta}, ${flight.status}`;
      //   return `${flight.airline} ${flight.flight}\n${flight.currentDate}\nLanding Time: ${flight.time}\n${flight.city}\nETA: ${flight.eta}\n${flight.status}\n-------------------------------- \n`;
    })
    .join("\n");

  // Write to file
  fs.writeFileSync(filePath, header + data, "utf8");

  return filePath;
};

const formatDateCsv = (currentDate) => {
  // Convert the string to a Date object if it's not already a Date
  const dateObj = new Date(currentDate);

  // Check if the conversion resulted in an invalid Date
  if (isNaN(dateObj)) {
    throw new Error("Invalid date format");
  }

  // Format the date in the desired style
  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Get the day of the week
  // const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" });

  return `${formattedDate}`;
};
export const formatDate = (currentDate) => {
  // Convert the string to a Date object if it's not already a Date
  const dateObj = new Date(currentDate);

  // Check if the conversion resulted in an invalid Date
  if (isNaN(dateObj)) {
    throw new Error("Invalid date format");
  }

  // Format the date in the desired style
  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Get the day of the week
  const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" });

  return `${formattedDate}, ${dayOfWeek}`;
};

export const toTitleCase = (text) => {
  return text
    .toLowerCase()
    .split(/(\s|\/)+/) // Split by spaces or slashes, keeping the separator
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(""); // Join back without altering the separators
};

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
