/**
 * Weather API module
 * @module weather
 */

const config = {
  WEATHER_API_KEY: '1477e69ca8244a47b67223849251406', // Your WeatherAPI key
  BASE_URL: 'https://api.weatherapi.com/v1'
};

/**
 * Fetches 5-day weather forecast
 * @param {string} location - Format: "City,Country"
 * @returns {Promise<Array>} Forecast data array
 * @throws {Error} API request failed
 */
export async function getForecast(location) {
  try {
    const response = await fetch(
      `${config.BASE_URL}/forecast.json?key=${config.WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=5`
    );

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    return data.forecast.forecastday.map(day => ({
      date: day.date,
      maxTemp: day.day.maxtemp_c,
      minTemp: day.day.mintemp_c,
      condition: day.day.condition.text,
      icon: day.day.condition.icon
    }));
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
}