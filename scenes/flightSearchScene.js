import { Scenes } from "telegraf";
import { generateFlightFile, formatFlightCode, formatDate } from "../utils.js";
import { getFlightByFlight } from "../redisService.js";
import fs from "fs";

const flightSearchScene = new Scenes.WizardScene(
  "flightSearch",
  // Step 1: Ask for flight number
  (ctx) => {
    ctx.reply("Enter the flight number:");
    ctx.wizard.state.data = {}; // Initialize state data
    return ctx.wizard.next();
  },
  // Step 2: Capture flight number and ask for Arrival/Departure
  async (ctx) => {
    // Check message length and return to step 1 if the message is shorter than 2 chars
    if (ctx.message.text.length < 2) {
      ctx.reply("Flight number should have more than 2 letters/numbers.");

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
    ctx.wizard.state.data.flightType = ctx.update.callback_query.data;
    try {
      // Fetch results based on flight number and choice
      const { flightNumber, flightType } = ctx.wizard.state.data;

      const data = await getFlightByFlight(flightNumber, flightType);

      if (!data || (Array.isArray(data) && data.length === 0)) {
        await ctx.reply("No flight data found.");
        return ctx.scene.leave();
      }

      const flights = Array.isArray(data) ? data : [data];
      const formattedData = flights
        .map((flight) => {
          const date = formatDate(flight.currentDate);
          return `${date}\n${flight.airline} - ${flight.flight}\n${flight.city}\nArrival: ${flight.time} - Eta: ${flight.eta}\nStatus: ${flight.status}\n`;
        })
        .join("---------------------------------------\n");
      if (formattedData.length > 4096) {
        const filePath = generateFlightFile(
          flights,
          flightType,
          `${flightNumber} ${flightType}s`
        );

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

export default flightSearchScene;
