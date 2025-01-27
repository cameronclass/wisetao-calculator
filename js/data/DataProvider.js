// DataProvider.js
import { CONFIG } from "./config.js";
import { State } from "./State.js";

export class DataProvider {
  constructor(jsonPath = CONFIG.jsonPath) {
    this.jsonPath = jsonPath;
  }

  /**
   * Загружает JSON-данные (из localStorage или с сервера),
   * затем сохраняет их в State.directionsData.
   */
  async loadAndSave() {
    try {
      // 1) Попытка загрузить из кэша (localStorage)
      const cached = localStorage.getItem(CONFIG.localStorageKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isCacheValid = Date.now() - timestamp < CONFIG.cacheTTL;
        if (isCacheValid) {
          // Если кэш валиден, записываем сразу в State и выходим
          State.directionsData = data;
          /* console.log("Данные загружены из кэша"); */
          return;
        }
      }

      // 2) Если кэша нет или он устарел => запрос
      const response = await fetch(this.jsonPath);
      if (!response.ok) {
        console.error("Ошибка при загрузке JSON:", response.statusText);
        return;
      }
      const dataFromServer = await response.json();

      // 3) Сохраняем в State
      State.directionsData = dataFromServer;
      /* console.log("Данные успешно загружены с сервера"); */

      // 4) Пишем в кэш
      localStorage.setItem(
        CONFIG.localStorageKey,
        JSON.stringify({
          data: dataFromServer,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Ошибка при загрузке JSON:", error);
    }
  }

  /**
   * Аналог вашего getCategoryData(categoryKey, direction='auto')
   * Но теперь берем из State.directionsData
   */
  getCategoryData(categoryKey, direction = "auto") {
    const directionData = State.directionsData?.categories?.[direction];
    if (!directionData) {
      console.error(
        `Направление "${direction}" не найдено в State.directionsData`
      );
      return null;
    }

    // train = массив без вложенных "category_name"
    if (direction === "train") {
      return directionData; // массив
    }

    // avia = массив категорий (где "others" тоже в массиве)
    if (direction === "avia") {
      return (
        directionData.find((cat) => cat.category_key === categoryKey) ||
        directionData.find((cat) => cat.category_key === "others")
      );
    }

    // auto = массив категорий
    return directionData.find((cat) => cat.category_key === categoryKey);
  }

  /**
   * Аналог вашего getPackagingData(type)
   */
  getPackagingData(type) {
    return State.directionsData?.packaging_prices?.find(
      (pack) => pack.type === type
    );
  }

  /**
   * Аналог вашего getDirectionData(direction)
   */
  getDirectionData(direction) {
    return State.directionsData?.categories?.[direction] || null;
  }
}
