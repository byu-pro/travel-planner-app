/**
 * GeoDB Cities API module
 * @module search
 */

const RAPID_API_KEY = "7e4ce6692amsh5b19a4be9569d1dp1d5818jsned5e100fb98b"; // Your RapidAPI key

/**
 * Searches for cities matching a query
 * @param {string} query - Search term (e.g., "Paris")
 * @returns {Promise<Array>} Array of city objects
 * @throws {Error} API request failed
 */
export async function searchDestinations(query) {
  const endpoint = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}&limit=5`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
      }
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    return data.data || []; // Returns city array or empty array
  } catch (error) {
    console.error("City search failed:", error);
    return [];
  }
}