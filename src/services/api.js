const API_URL = 'http://localhost:3001/api';

export const api = {
  // Games (updated to use gamesdatabase)
  async getAllGames() {
    const response = await fetch(`${API_URL}/gamesdatabase`);
    if (!response.ok) throw new Error('Failed to fetch games');
    return await response.json();
  },

  async addGame(game) {
    const response = await fetch(`${API_URL}/gamesdatabase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game),
    });
    if (!response.ok) throw new Error('Failed to add game');
    return await response.json();
  },

  // Consoles
  async getAllConsoles() {
    const response = await fetch(`${API_URL}/consoles`);
    if (!response.ok) throw new Error('Failed to fetch consoles');
    return await response.json();
  },

  async addConsole(console) {
    const response = await fetch(`${API_URL}/consoles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(console),
    });
    if (!response.ok) throw new Error('Failed to add console');
    return await response.json();
  },

  // Regions
  async getAllRegions() {
    const response = await fetch(`${API_URL}/regions`);
    if (!response.ok) throw new Error('Failed to fetch regions');
    return await response.json();
  },

  async addRegion(region) {
    const response = await fetch(`${API_URL}/regions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(region),
    });
    if (!response.ok) throw new Error('Failed to add region');
    return await response.json();
  },

  // Collections
  async getAllCollections() {
    const response = await fetch(`${API_URL}/collection`);
    if (!response.ok) throw new Error('Failed to fetch collections');
    return await response.json();
  },

  async addCollection(item) {
    const response = await fetch(`${API_URL}/collection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to add collection item');
    return await response.json();
  },

  // Prices
  async getAllPrices() {
    const response = await fetch(`${API_URL}/prices`);
    if (!response.ok) throw new Error('Failed to fetch prices');
    return await response.json();
  },

  async addPrice(price) {
    const response = await fetch(`${API_URL}/prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(price),
    });
    if (!response.ok) throw new Error('Failed to add price');
    return await response.json();
  },

  // Settings
  async getSetting(key) {
    const response = await fetch(`${API_URL}/settings/${key}`);
    if (!response.ok) throw new Error('Failed to fetch setting');
    return await response.json();
  },

  async saveSetting(key, value) {
    const response = await fetch(`${API_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (!response.ok) throw new Error('Failed to save setting');
    return await response.json();
  },

  async getAllSettings() {
    const response = await fetch(`${API_URL}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return await response.json();
  },

  // Add getLatestPrice method
  async getLatestPrice(pricechartingId) {
    const response = await fetch(`${API_URL}/prices/latest/${pricechartingId}`);
    if (!response.ok) throw new Error('Failed to fetch latest price');
    return await response.json();
  },

  // Add this to the api object
  async deleteCollection(id) {
    const response = await fetch(`${API_URL}/collection/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete collection item');
    return await response.json();
  }
}; 