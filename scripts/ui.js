import { searchDestinations } from './search.js';

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("destinationInput");
  const button = document.getElementById("searchBtn");
  const resultsContainer = document.getElementById("results");
  const itineraryContainer = document.getElementById("itinerary");

  // Search button click
  button.addEventListener("click", async () => {
    const query = input.value.trim();
    if (!query) return;

    resultsContainer.innerHTML = "<p>Searching...</p>";

    const cities = await searchDestinations(query);

    if (!cities || cities.length === 0) {
      resultsContainer.innerHTML = "<p>No cities found.</p>";
      return;
    }

    // Display results as draggable cards
    resultsContainer.innerHTML = cities.map((city, index) => `
      <div 
        class="result" 
        draggable="true" 
        data-city='${JSON.stringify(city)}'
        id="city-${index}"
      >
        <h3>${city.city}, ${city.country}</h3>
        <p>${city.region} — Population: ${city.population.toLocaleString()}</p>
      </div>
    `).join("");

    // Add dragstart event to each result card
    document.querySelectorAll(".result").forEach(el => {
      el.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", el.getAttribute("data-city"));
      });
    });
  });

  // Allow drop and style feedback on itinerary panel
  itineraryContainer.addEventListener("dragover", (e) => {
    e.preventDefault(); // Allow drop
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

      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <h4>${city.city}, ${city.country}</h4>
        <p>${city.region}</p>
      `;
      itineraryContainer.appendChild(card);
    }
  });
});
