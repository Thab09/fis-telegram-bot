import { Scenes } from "telegraf";
import { generateFlightFile, formatFlightCode, formatDate } from "../utils.js";
import { getFlightByAirline } from "../redisService.js";
import fs from "fs";

const airlineSearchScene = new Scenes.WizardScene(
  "airlineSearch",
  // Step 1: Ask for airline name
  (ctx) => {
    ctx.reply("Enter airline name:");
    ctx.wizard.state.data = {}; // Initialize state data
    return ctx.wizard.next();
  },
  // Step 2: Capture airline name and ask for Arrival/Departure
  async (ctx) => {
    // Check message length and return to step 1 if the message is shorter than 2 chars
    if (ctx.message.text.length < 2) {
      ctx.reply("Airline name should have more than 2 letters");

      ctx.wizard.selectStep(0); // Go back to step 0
      return ctx.wizard.steps[0](ctx); // Re-execute step 0 logic
    }
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
          const date = formatDate(flight.currentDate);
          return `${date}\n${flight.airline} - ${flight.flight}\n${flight.city}\nArrival: ${flight.time} - Eta: ${flight.eta}\nStatus: ${flight.status}\n`;
        })
        .join("\n");
      if (formattedData.length > 4096) {
        const filePath = generateFlightFile(
          flights,
          flightType,
          `${airlineName} ${flightType}s`
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

export default airlineSearchScene;
