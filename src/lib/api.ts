import { ipcMain } from "electron";
import * as cardsApi from "src/lib/cards-api";
import * as decksApi from "src/lib/decks-api";
import * as reviewsApi from "src/lib/reviews-api";

export const api = {
  decks: decksApi,
  cards: cardsApi,
  reviews: reviewsApi,
} as const;

export type Api = typeof api;

function registerApi(name: string, api: object): void {
  Object.entries(api).forEach(([action, fn]) => {
    if (typeof fn === "function") {
      ipcMain.handle(`${name}:${action}`, async (_, ...args) => {
        try {
          return await fn(...args);
        } catch (error) {
          console.error(`Error in API ${action}:`, error);
          throw error;
        }
      });
    }
  });
}

export function registerApis() {
  Object.entries(api).forEach(([name, api]) => {
    registerApi(name, api);
  });
}
