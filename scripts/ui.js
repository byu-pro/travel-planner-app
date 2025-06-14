import { searchDestinations } from './search.js';
import { getForecast } from './weather.js';

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("destinationInput");
  const button = document.getElementById("searchBtn");
  const resultsContainer = document.getElementById("results");
  const itineraryContainer = document.getElementById("itinerary");
  const exportBtn = document.getElementById("exportBtn");

  // Load saved itinerary
  loadItinerary();

  // Search button
  button.addEventListener("click", async () => {
    const query = input.value.trim();
    if (!query) return;

    resultsContainer.innerHTML = "<p>Searching...</p>";
    const cities = await searchDestinations(query);

    if (!cities?.length) {
      resultsContainer.innerHTML = "<p>No results found</p>";
      return;
    }

    // Display cities
    resultsContainer.innerHTML = cities.map((city, i) => `
      <div class="result" draggable="true" data-city='${JSON.stringify(city)}' id="city-${i}">
        <h3>${city.city}, ${city.country}</h3>
        <p>${city.region}</p>
      </div>
    `).join("");

    // Add drag events
    document.querySelectorAll(".result").forEach(el => {
      el.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", el.getAttribute("data-city"));
      });
    });

    // Load weather for first result
    await updateWeather(cities[0]);
  });

  // Itinerary drop zone
  itineraryContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    itineraryContainer.classList.add("dragover");
  });

  itineraryContainer.addEventListener("dragleave", () => {
    itineraryContainer.classList.remove("dragover");
  });

  itineraryContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    itineraryContainer.classList.remove("dragover");

    const cityData = e.dataTransfer.getData("text/plain");
    if (cityData) {
      const city = JSON.parse(cityData);
      const time = prompt("Enter time (e.g., 9:00 AM):") || "Unspecified time";
      
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <h4>${time} - ${city.city}, ${city.country}</h4>
        <p>${city.region}</p>
      `;
      itineraryContainer.appendChild(card);
      saveItinerary();
    }
  });

  // Export button
  exportBtn.addEventListener("click", () => {
    window.print();
  });

  // Helper functions
  async function updateWeather(city) {
    const weatherPanel = document.getElementById("weather");
    weatherPanel.innerHTML = "<p>Loading weather...</p>";
    
    try {
      const forecast = await getForecast(`${city.city},${city.country}`);
      
      if (!forecast) {
        weatherPanel.innerHTML = "<p class='error'>Weather data unavailable</p>";
        return;
      }

      weatherPanel.innerHTML = `
        <h3>${city.city}, ${city.country}</h3>
        <div class="weather-grid">
          ${forecast.map(day => `
            <div class="weather-card">
              <h4>${new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</h4>
              <img src="https:${day.icon}" alt="${day.condition}">
              <p>${day.maxTemp}°C / ${day.minTemp}°C</p>
              <small>${day.condition}</small>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      weatherPanel.innerHTML = `<p class="error">Failed to load weather: ${error.message}</p>`;
    }
  }

  function saveItinerary() {
    const items = Array.from(itineraryContainer.children).map(card => card.innerHTML);
    localStorage.setItem("itinerary", JSON.stringify(items));
  }

  function loadItinerary() {
    const saved = JSON.parse(localStorage.getItem("itinerary")) || [];
    itineraryContainer.innerHTML = saved.join("");
  }
});