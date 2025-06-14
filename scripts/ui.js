/**
 * Main UI controller module
 * @module ui
 */

import { searchDestinations } from './search.js';
import { getForecast } from './weather.js';

document.addEventListener("DOMContentLoaded", initApp);

// Initialize application
function initApp() {
  const input = document.getElementById("destinationInput");
  const button = document.getElementById("searchBtn");
  const exportBtn = document.getElementById("exportBtn");
  const itineraryContainer = document.getElementById("itinerary");

  // Load saved itinerary
  loadItinerary();

  // Event listeners
  button.addEventListener("click", handleSearch);
  exportBtn.addEventListener("click", () => window.print());
  setupDragAndDrop(itineraryContainer);

  // Autocomplete
  input.addEventListener("input", debounce(async (e) => {
    if (e.target.value.trim().length > 2) {
      await handleSearch();
    }
  }, 500));
}

// Handle city search
async function handleSearch() {
  const input = document.getElementById("destinationInput");
  const resultsContainer = document.getElementById("results");
  const query = input.value.trim();

  if (!query) {
    showError("Please enter a city name", resultsContainer);
    return;
  }

  showLoading(resultsContainer);

  try {
    const cities = await searchDestinations(query);
    if (!cities?.length) {
      showError("No cities found", resultsContainer);
      return;
    }

    displayCities(cities);
    await updateWeather(cities[0]);
  } catch (error) {
    showError("Search failed", resultsContainer);
  }
}

// Display city results
function displayCities(cities) {
  const container = document.getElementById("results");
  container.innerHTML = cities.map((city, i) => `
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
}

// Update weather panel
async function updateWeather(city) {
  const weatherPanel = document.getElementById("weather");
  weatherPanel.innerHTML = `
    <div class="weather-grid loading">
      ${Array(5).fill().map(() => `
        <div class="weather-card skeleton"></div>
      `).join('')}
    </div>
  `;

  try {
    const forecast = await getForecast(`${city.city},${city.country}`);
    
    if (!forecast) {
      weatherPanel.innerHTML = "<p class='error'>Weather unavailable</p>";
      return;
    }

    weatherPanel.innerHTML = `
      <h3>${city.city}, ${city.country}</h3>
      <div class="weather-grid">
        ${forecast.map(day => `
          <div class="weather-card">
            <h4>${new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</h4>
            <img src="https:${day.icon}" alt="Weather: ${day.condition}">
            <p>${day.maxTemp}°C / ${day.minTemp}°C</p>
            <small>${day.condition}</small>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    weatherPanel.innerHTML = `<p class="error">Weather load failed</p>`;
  }
}

// Drag and drop setup
function setupDragAndDrop(container) {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    container.classList.add("dragover");
  });

  container.addEventListener("dragleave", () => {
    container.classList.remove("dragover");
  });

  container.addEventListener("drop", (e) => {
    e.preventDefault();
    container.classList.remove("dragover");

    const cityData = e.dataTransfer.getData("text/plain");
    if (cityData) addToItinerary(JSON.parse(cityData));
  });
}

// Add item to itinerary
function addToItinerary(city) {
  if (!city || typeof city !== 'object') {
    console.error("Invalid city data:", city);
    return;
  }

  const container = document.getElementById("itinerary");
  const time = prompt("Enter time (e.g., 9:00 AM):") || "Unspecified time";
  
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <div class="card-content">
      <h4>${time} - ${city.city}, ${city.country}</h4>
      <p>${city.region}</p>
    </div>
    <button class="delete-btn" aria-label="Remove activity">×</button>
  `;
  
  // Edit on double-click
  card.addEventListener("dblclick", () => {
    const currentText = card.querySelector("h4").textContent;
    const newTime = prompt("Edit time:", currentText.split(" - ")[0]);
    if (newTime) {
      card.querySelector("h4").textContent = `${newTime} - ${city.city}, ${city.country}`;
      saveItinerary();
    }
  });

  // Delete with confirmation
  card.querySelector(".delete-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    if (confirm("Remove this activity permanently?")) {
      card.classList.add("fade-out");
      setTimeout(() => {
        card.remove();
        saveItinerary();
      }, 300);
    }
  });
  
  container.appendChild(card);
  saveItinerary();
}

// Save itinerary to localStorage
function saveItinerary() {
  const items = Array.from(document.getElementById("itinerary").children)
    .map(card => card.innerHTML);
  localStorage.setItem("itinerary", JSON.stringify(items));
}

// Load saved itinerary
function loadItinerary() {
  const saved = JSON.parse(localStorage.getItem("itinerary")) || [];
  const container = document.getElementById("itinerary");
  container.innerHTML = saved.join("");
  
  // Reattach event listeners to loaded items
  container.querySelectorAll(".card").forEach(card => {
    // Edit listener
    card.addEventListener("dblclick", function() {
      const h4 = this.querySelector("h4");
      const currentText = h4.textContent;
      const newTime = prompt("Edit time:", currentText.split(" - ")[0]);
      if (newTime) {
        h4.textContent = `${newTime}${currentText.substring(currentText.indexOf(" - "))}`;
        saveItinerary();
      }
    });

    // Delete listener
    const deleteBtn = card.querySelector(".delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("Remove this activity permanently?")) {
          card.classList.add("fade-out");
          setTimeout(() => {
            card.remove();
            saveItinerary();
          }, 300);
        }
      });
    }
  });
}

// Helper: Show loading state
function showLoading(container) {
  container.innerHTML = "<p>Searching...</p>";
}

// Helper: Show error message
function showError(message, container) {
  container.innerHTML = `<p class="error">${message}</p>`;
}

// Debounce function for autocomplete
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}