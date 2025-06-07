import { searchDestinations } from './search.js';

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("destinationInput");
  const button = document.getElementById("searchBtn");
  const results = document.getElementById("results");

  button.addEventListener("click", async () => {
    const query = input.value.trim();
    if (!query) return;

    results.innerHTML = "<p>Searching...</p>";

    const cities = await searchDestinations(query);

    if (cities.length === 0) {
      results.innerHTML = "<p>No cities found.</p>";
      return;
    }

    // Display the results
    results.innerHTML = cities.map(city => `
      <div class="result">
        <h3>${city.city}, ${city.country}</h3>
        <p>${city.region} — Population: ${city.population.toLocaleString()}</p>
      </div>
    `).join("");
  });
});
