import { Telegraf, Scenes, session } from "telegraf";
import flightSearchScene from "./scenes/flightSearchScene.js";
import citySearchScene from "./scenes/citySearchScene.js";
import airlineSearchScene from "./scenes/airlineSearchScene.js";
import fs from "fs";
import { generateFlightFile } from "./utils.js";
import { getAllFlights } from "./redisService.js";

// Stage: where you add the scenes
const stage = new Scenes.Stage([
  flightSearchScene,
  citySearchScene,
  airlineSearchScene,
]);
const bot = new Telegraf("7638483303:AAGgZYXlred2vyxS4s_VENi7_doEKGkEEv0");
// Enable session middleware
bot.use(session());
bot.use(stage.middleware()); // Use stage middleware to enable scenes
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

// Handle "Search by Flight"
bot.hears("Search by Flight", (ctx) => {
  ctx.scene.enter("flightSearch"); // Enter the flight search scene
});
bot.hears("Search by City", (ctx) => {
  ctx.scene.enter("citySearch"); // Enter the city search scene
});
bot.hears("Search by Airline", (ctx) => {
  ctx.scene.enter("airlineSearch"); // Enter the airline search scene
});

// Handle "All Arriving Flights"
bot.hears("All Arriving Flights", async (ctx) => {
  const flights = await getAllFlights("Arrival");
  if (flights.length > 0) {
    // Generate the file with flight details
    const filePath = generateFlightFile(flights, "Arrival", "All Arivals");

    // Send the file as a document
    await ctx.sendDocument({ source: filePath });

    // Optional: Remove the file after sending it
    fs.unlinkSync(filePath); // Clean up the file after sending
  } else {
    await ctx.reply("No arrival flights found.");
  }
  //   ctx.reply(JSON.stringify(data, null, 2));
});

// Handle "All Departing Flights"
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

    // Optional: Remove the file after sending it
    fs.unlinkSync(filePath); // Clean up the file after sending
  } else {
    await ctx.reply("No departure flights found.");
  }
  // Call function to fetch all departing flights
});

// Start webhook via launch method (preferred)
bot.launch({
  webhook: {
    domain: "https://4441-27-114-169-7.ngrok-free.app",
    port: 3000,
  },
});

// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// // Get the directory name for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Function to generate a text file with flight data
// const generateFlightFile = (flights, declaration) => {
//   const filePath = path.join(__dirname, `${declaration}.csv`);
//   const city = declaration === "Arrival" ? "ORIGIN" : "DESTINATION";
//   const header = `DATE, AIRLINE, FLIGHT NO., ${city}, TIME, EST, STATUS\n`;
//   const data = flights
//     .map((flight) => {
//       return `${flight.currentDate},${flight.airline}, ${flight.flight}, ${flight.city}, ${flight.time}, ${flight.eta}, ${flight.status}`;
//       //   return `${flight.airline} ${flight.flight}\n${flight.currentDate}\nLanding Time: ${flight.time}\n${flight.city}\nETA: ${flight.eta}\n${flight.status}\n-------------------------------- \n`;
//     })
//     .join("\n");

//   // Write to file
//   fs.writeFileSync(filePath, header + data, "utf8");

//   return filePath;
// };
