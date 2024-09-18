import * as cheerio from 'cheerio';
import axios from 'axios';

const scraper = async (url, wot) => {
  const { data } = await axios.get(url);
  
  const $ = cheerio.load(data);
  const table = $('body > div > table > tbody > tr:nth-of-type(6) > td > table > tbody');

  let currentDate = '';

  table.find('tr').each((i, row) => {
    const isDateRow = $(row).find('tr>td.sumheadtop').length > 0;
    
    // Check if the row contains the date
    if (isDateRow) {
      currentDate = $(row).find('tr>td.sumheadtop').text().trim();
    } else if ($(row).attr('valign') === 'top') {
      const airline = $(row).find('.airline').text().trim();
      const flight = $(row).find('.flight').text().trim();
      const city = $(row).find('.city').text().trim();
      const time = $(row).find('.time').text().trim();
      const eta = $(row).find('.estimated').text().trim();
      const status = $(row).find('div.status').text().trim();
  
      // Log the current date with the flight information
      console.log({ wot, currentDate, airline, flight, city, time, eta, status });
    }
  });
};

export default scraper;