import { Scenes } from "telegraf";

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

    // await ctx.reply(JSON.stringify(data, null, 2));
    await ctx.reply(flightNumber);

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

    await ctx.reply(JSON.stringify(data, null, 2));

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

    // Fetch results based on flight number and choice
    const { airlineName, flightType } = ctx.wizard.state.data;

    const data = await getFlightByAirline(airlineName, flightType);

    await ctx.reply(JSON.stringify(data, null, 2));

    return ctx.scene.leave(); // Exit scene after the process is complete
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
  // Convert to uppercase, then match first two letters and digits
  return flightCode.toUpperCase().replace(/([A-Z0-9]{2})(\d+)/, "$1 $2");
};
