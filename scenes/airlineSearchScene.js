import { Scenes } from "telegraf";
import { generateFlightFile, formatFlightCode, formatDate } from "../utils.js";
import { getFlightByAirline } from "../redisService.js";
import fs from "fs";

/*
 * Telegram Scene: airlineSearchScene
 * Description: A scene consisting of three steps to collect the necessary information
 *              from the telegram user to get the search result.
 * Inputs:
 *  - Step 1: user will be prompted to enter a airline name
 *  - Step 2: user will be prompted to select a declaration ('Arrival' or 'Departure')
 * Returns:
 *  - A formatted string of flight details or a csv file if the message is longer than 4096 chars
 */
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

    ctx.wizard.state.data.airlineName = await toTitleCase(ctx.message.text);

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
      const { airlineName, flightType } = ctx.wizard.state.data;

      // Fetch results based on airline name and declaration
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

        await ctx.sendDocument({ source: filePath });

        fs.unlinkSync(filePath);
      } else {
        await ctx.reply(formattedData);
      }
    } catch (error) {
      console.error("Error handling flight data:", error);
      await ctx.reply(
        "An error occurred while processing Search Flight by Airline. Please try again later."
      );
    } finally {
      return ctx.scene.leave();
    }
  }
);

export default airlineSearchScene;
