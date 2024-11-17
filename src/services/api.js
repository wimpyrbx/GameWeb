const API_URL = 'http://localhost:3001/api';

export const api = {
  // Games (updated to use gamesdatabase)
  async getAllGames(page = 1, limit = 1000) {
    const response = await fetch(`${API_URL}/gamesdatabase?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch games');
    const data = await response.json();
    return data;
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
    const response = await fetch(`http://localhost:3001/api/settings/${key}`);
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
  },

  // Add to your api object
  async getExchangeRate(currency = 'NOK') {
    const response = await fetch(`${API_URL}/exchange-rate/${currency}`);
    if (!response.ok) throw new Error('Failed to fetch exchange rate');
    return await response.json();
  },

  // Add to your api object
  async updateCollectionItem(id, item) {
    const response = await fetch(`${API_URL}/collection/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to update collection item');
    return await response.json();
  },

  // Add to your api object
  async refreshExchangeRate(currency = 'NOK') {
    const response = await fetch(`${API_URL}/exchange-rate/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency })
    });
    if (!response.ok) throw new Error('Failed to refresh exchange rate');
    return await response.json();
  },

  async getTableSchemas() {
    const response = await fetch(`${API_URL}/schemas`);
    if (!response.ok) throw new Error('Failed to fetch schemas');
    return await response.json();
  },

  async getTableColumns(table) {
    const response = await fetch(`${API_URL}/schemas/${table}/columns`);
    if (!response.ok) throw new Error('Failed to fetch columns');
    return await response.json();
  },

  // Add this method to the api object
  async clearTable(tableName) {
    const response = await fetch(`${API_URL}/clear-table/${tableName}`, {
      method: 'POST'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to clear table');
    }
    return await response.json();
  },

  // Add this method to the api object
  async clearDatabase() {
    const response = await fetch(`${API_URL}/clear-database`, {
      method: 'POST'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to clear database');
    }
    return await response.json();
  },

  // Update the executeSQL method
  executeSQL: async (query) => {
    try {
      const response = await fetch(`${API_URL}/execute-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response format');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to execute query');
      }

      return data;
    } catch (error) {
      if (error.message === 'Server returned an invalid response format') {
        throw new Error('Server error: The server returned an invalid response');
      }
      throw error;
    }
  },

  // Fix the getRatingsByRegion method - it should be inside the api object
  async getRatingsByRegion(regionId) {
    const response = await fetch(`${API_URL}/ratings/region/${regionId}`);
    if (!response.ok) throw new Error('Failed to fetch ratings');
    return await response.json();
  },
}; 