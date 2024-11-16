import { api } from './api';

export const gamesDB = {
  async getAllGames() {
    return await api.getAllGames();
  },
  
  async addGame(game) {
    return await api.addGame(game);
  },
  
  async deleteGame(id) {
    return await api.deleteGame(id);
  },
  
  async updateGame(game) {
    return await api.updateGame(game);
  }
};

export const consoleDB = {
  async getAllConsoles() {
    return await api.getAllConsoles();
  },
  async addConsole(console) {
    return await api.addConsole(console);
  },
  async deleteConsole(id) {
    return await api.deleteConsole(id);
  }
};

export const regionDB = {
  async getAllRegions() {
    return await api.getAllRegions();
  },
  async addRegion(region) {
    return await api.addRegion(region);
  },
  async deleteRegion(id) {
    return await api.deleteRegion(id);
  }
};

export const collectionDB = {
  async getAllCollectionItems() {
    return await api.getAllCollections();
  },
  async addCollectionItem(item) {
    return await api.addCollection(item);
  },
  async deleteCollectionItem(id) {
    return await api.deleteCollection(id);
  }
};

export const pricesDB = {
  async getAllPrices() {
    return await api.getAllPrices();
  },
  async addPrice(price) {
    return await api.addPrice(price);
  },
  async getLatestPrice(pricechartingId) {
    return await api.getLatestPrice(pricechartingId);
  }
};

export const saveSetting = async (key, value) => {
  return await api.saveSetting(key, value);
};

export const getSetting = async (key) => {
  const response = await api.getSetting(key);
  return response.value;
};

// Update other DB functions similarly 