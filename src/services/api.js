const API_URL = 'http://localhost:3001/api';

export const api = {
  async getAllGames() {
    const response = await fetch(`${API_URL}/games`);
    if (!response.ok) throw new Error('Failed to fetch games');
    return await response.json();
  },

  async addGame(game) {
    const response = await fetch(`${API_URL}/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(game),
    });
    if (!response.ok) throw new Error('Failed to add game');
    return await response.json();
  },

  // Add more API methods...
}; 