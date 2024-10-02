import { Scenes } from "telegraf";
import { generateFlightFile } from "./utils.js";
import fs from "fs";
import {
  getFlightByFlight,
  getFlightByCity,
  getFlightByAirline,
} from "./redisService.js";

export const flightSearchScene = new Scenes.WizardScene(
  "flightSearch",
  // Step 1: Ask for flight number
  (ctx) => {
    ctx.reply("Enter the flight number:");
    ctx.wizard.state.data = {}; // Initialize state data
    return ctx.wizard.next();
  },
  // Step 2: Capture flight number and ask for Arrival/Departure
  async (ctx) => {
    if (ctx.message.text.length < 2) {
      ctx.reply("Flight number should be longer than 2 characters");

      ctx.wizard.selectStep(0); // Go back to step 0
      return ctx.wizard.steps[0](ctx); // Re-execute step 0 logic
    }
    ctx.wizard.state.data.flightNumber = await formatFlightCode(
      ctx.message.text
    ); // Save flight number
    ctx.reply("Is it an Arrival or Departure?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Arrival", callback_data: "Arrival" }],
          [{ text: "Departure", callback_data: "Departure" }],
        ],
      },
    });
    return ctx.wizard.next();
  },
  // Step 3: Capture "Arrival" or "Departure" and fetch result
  async (ctx) => {
    ctx.wizard.state.data.flightType = ctx.update.callback_query.data; // Save Arrival/Departure

    // Fetch results based on flight number and choice
    const { flightNumber, flightType } = ctx.wizard.state.data;

    const data = await getFlightByFlight(flightNumber, flightType);
    if (!data) {
      await ctx.reply("No flight data found.");
      return ctx.scene.leave();
    }
    const flights = Array.isArray(data) ? data : [data];
    const formattedData = flights
      .map((flight) => {
        // return `Date: ${flight.currentDate}\nAirline: ${flight.airline}\nFlight No: ${flight.flight}\nLanding Time: ${flight.time}\nCity: ${flight.city}\nETA: ${flight.eta}\nStatus: ${flight.status}\n-------------------------------- \n`;
        return `${flight.currentDate}\n${flight.airline}\n${flight.flight}\n${flight.city}\nArrival: ${flight.time} / Eta: ${flight.eta}\nStatus: ${flight.status}\n---------------------------------------`;
      })
      .join("\n");
    await ctx.reply(formattedData);
    // await ctx.reply(JSON.stringify(data, null, 2));

    return ctx.scene.leave(); // Exit scene after the process is complete
  }
);
export const citySearchScene = new Scenes.WizardScene(
  "citySearch",
  // Step 1: Ask for city name
  (ctx) => {
    ctx.reply("Enter the city name:");
    ctx.wizard.state.data = {}; // Initialize state data
    return ctx.wizard.next();
  },
  // Step 2: Capture city name and ask for Arrival/Departure
  async (ctx) => {
    ctx.wizard.state.data.cityName = await toTitleCase(ctx.message.text); // Save city name
    ctx.reply("Is it an Arrival or Departure?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Arrival", callback_data: "Arrival" }],
          [{ text: "Departure", callback_data: "Departure" }],
        ],
      },
    });
    return ctx.wizard.next();
  },
  // Step 3: Capture "Arrival" or "Departure" and fetch result
  async (ctx) => {
    ctx.wizard.state.data.flightType = ctx.update.callback_query.data; // Save Arrival/Departure

    // Fetch results based on city name and choice
    const { cityName, flightType } = ctx.wizard.state.data;

    const data = await getFlightByCity(cityName, flightType);
    if (!data) {
      await ctx.reply("No flight data found.");
      return ctx.scene.leave();
    }
    const flights = Array.isArray(data) ? data : [data];
    const formattedData = flights
      .map((flight) => {
        // return `Date: ${flight.currentDate}\nAirline: ${flight.airline}\nFlight No: ${flight.flight}\nLanding Time: ${flight.time}\nCity: ${flight.city}\nETA: ${flight.eta}\nStatus: ${flight.status}\n-------------------------------- \n`;
        return `${flight.currentDate}\n${flight.airline}\n${flight.flight}\n${flight.city}\nArrival: ${flight.time} / Eta: ${flight.eta}\nStatus: ${flight.status}\n---------------------------------------`;
      })
      .join("\n");
    await ctx.reply(formattedData);

    return ctx.scene.leave(); // Exit scene after the process is complete
  }
);
export const airlineSearchScene = new Scenes.WizardScene(
  "airlineSearch",
  // Step 1: Ask for airline name
  (ctx) => {
    ctx.reply("Enter the airline number:");
    ctx.wizard.state.data = {}; // Initialize state data
    return ctx.wizard.next();
  },
  // Step 2: Capture airline name and ask for Arrival/Departure
  async (ctx) => {
    ctx.wizard.state.data.airlineName = await toTitleCase(ctx.message.text); // Save airline name
    ctx.reply("Is it an Arrival or Departure?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Arrival", callback_data: "Arrival" }],
          [{ text: "Departure", callback_data: "Departure" }],
        ],
      },
    });
    return ctx.wizard.next();
  },
  // Step 3: Capture "Arrival" or "Departure" and fetch result
  async (ctx) => {
    ctx.wizard.state.data.flightType = ctx.update.callback_query.data; // Save Arrival/Departure
    try {
      // Fetch results based on flight number and choice
      const { airlineName, flightType } = ctx.wizard.state.data;

      const data = await getFlightByAirline(airlineName, flightType);

      if (!data || (Array.isArray(data) && data.length === 0)) {
        await ctx.reply("No flight data found.");
        return ctx.scene.leave();
      }
      const flights = Array.isArray(data) ? data : [data];
      const formattedData = flights
        .map((flight) => {
          return `${flight.currentDate}\n${flight.airline}\n${flight.flight}\n${flight.city}\nArrival: ${flight.time} / Eta: ${flight.eta}\nStatus: ${flight.status}\n---------------------------------------`;
        })
        .join("\n");
      if (formattedData.length > 4096) {
        const filePath = generateFlightFile(flights, "Arrivals");

        // Send the file as a document
        await ctx.sendDocument({ source: filePath });

        // Optional: Remove the file after sending it
        fs.unlinkSync(filePath); // Clean up the file after sending
      } else {
        await ctx.reply(formattedData);
      }
    } catch (error) {
      console.error("Error handling flight data:", error);
      await ctx.reply(
        "An error occurred while processing flight data. Please try again later."
      );
    } finally {
      return ctx.scene.leave();
    }
  }
);

const toTitleCase = (text) => {
  return text
    .toLowerCase()
    .split(/(\s|\/)+/) // Split by spaces or slashes, keeping the separator
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(""); // Join back without altering the separators
};
const formatFlightCode = (flightCode) => {
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
