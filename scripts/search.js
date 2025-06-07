const RAPID_API_KEY = "7e4ce6692amsh5b19a4be9569d1dp1d5818jsned5e100fb98b";  // ← Replace this with your actual RapidAPI key

export async function searchDestinations(query) {
  const endpoint = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}&limit=10`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
      }
    });

    const data = await response.json();
    return data.data;  // Returns an array of city objects
  } catch (error) {
    console.error("API fetch error:", error);
    return [];
  }
}
