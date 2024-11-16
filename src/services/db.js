import { api } from './api';

export const gamesDB = {
  async getAllGames() {
    return await api.getAllGames();
  },
  
  async addGame(game) {
    return await api.addGame(game);
  },
  
  // ... other methods
};

// Update other DB functions similarly 