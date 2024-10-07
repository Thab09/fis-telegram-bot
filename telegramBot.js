import { Telegraf, Scenes, session } from "telegraf";
import { generateFlightFile } from "./utils.js";
import { getAllFlights } from "./redisService.js";
import flightSearchScene from "./scenes/flightSearchScene.js";
import citySearchScene from "./scenes/citySearchScene.js";
import airlineSearchScene from "./scenes/airlineSearchScene.js";
import rateLimit from "telegraf-ratelimit";
import { rateLimitConfig } from "./utils.js";
import fs from "fs";

// Add the scenes to the stage
const stage = new Scenes.Stage([
  flightSearchScene,
  citySearchScene,
  airlineSearchScene,
]);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

//MIDDLEWARES
bot.use(rateLimit(rateLimitConfig));
bot.use(session());
bot.use(stage.middleware());

// Options from the start command
bot.start((ctx) => {
  ctx.reply("Choose an option:", {
    reply_markup: {
      keyboard: [
        [{ text: "All Arriving Flights" }, { text: "All Departing Flights" }],
        [
          { text: "Search by Flight" },
          { text: "Search by City" },
          { text: "Search by Airline" },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

// Handle "All Arriving Flights" option
bot.hears("All Arriving Flights", async (ctx) => {
  const flights = await getAllFlights("Arrival");
  if (flights.length > 0) {
    // Generate the file with flight details
    const filePath = generateFlightFile(flights, "Arrival", "All Arivals");

    // Send the file as a document
    await ctx.sendDocument({ source: filePath });

    // Remove the file after sending it
    fs.unlinkSync(filePath);
  } else {
    await ctx.reply("No arrival flights found.");
  }
});

// Handle "All Departing Flights" option
bot.hears("All Departing Flights", async (ctx) => {
  const flights = await getAllFlights("Departure");
  if (flights.length > 0) {
    // Generate the file with flight details
    const filePath = generateFlightFile(
      flights,
      "Departures",
      "All Departures"
    );

    // Send the file as a document
    await ctx.sendDocument({ source: filePath });

    // Remove the file after sending it
    fs.unlinkSync(filePath);
  } else {
    await ctx.reply("No departure flights found.");
  }
});

// Handle "Search by Flight" option - User enters the flightSearch Scene
bot.hears("Search by Flight", (ctx) => {
  ctx.scene.enter("flightSearch");
});

// Handle "Search by City" option - User enters the citySearch Scene
bot.hears("Search by City", (ctx) => {
  ctx.scene.enter("citySearch");
});

// Handle "Search by Airline" option - User enters the airlineSearch Scene
bot.hears("Search by Airline", (ctx) => {
  ctx.scene.enter("airlineSearch");
});

// Launch the hook via webhook - using ngrok while in developement
bot.launch({
  webhook: {
    domain: "https://7016-124-195-208-158.ngrok-free.app",
    port: 3000,
  },
});
