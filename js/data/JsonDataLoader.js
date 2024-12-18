// JsonDataLoader.js
import { CONFIG } from "../config.js";

export class JsonDataLoader {
  constructor(jsonPath = CONFIG.jsonPath) {
    this.jsonPath = jsonPath;
    this.data = null;
  }

  async load() {
    try {
      // Попытка загрузить данные из кэша
      const cached = localStorage.getItem(CONFIG.localStorageKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Проверяем, не истёк ли TTL
        if (Date.now() - timestamp < CONFIG.cacheTTL) {
          this.data = data;
          console.log("Данные загружены из кэша");
          return;
        }
      }

      // Если кэш отсутствует или устарел, делаем запрос
      const response = await fetch(this.jsonPath);
      if (!response.ok) {
        console.error("Ошибка при загрузке JSON:", response.statusText);
        return;
      }

      this.data = await response.json();
      /* console.log("Данные успешно загружены с сервера:", this.data); */
      console.log("Данные успешно загружены с сервера");

      // Сохраняем в кэш
      localStorage.setItem(
        CONFIG.localStorageKey,
        JSON.stringify({ data: this.data, timestamp: Date.now() })
      );
    } catch (error) {
      console.error("Ошибка загрузки JSON:", error);
    }
  }

  getCategoryData(categoryKey, direction = "auto") {
    const directionData = this.data?.categories?.[direction];
    if (!directionData) {
      console.error(`Направление ${direction} не найдено в JSON.`);
      return null;
    }

    if (direction === "train") {
      return directionData;
    }

    if (direction === "avia") {
      return (
        directionData.find((cat) => cat.category_key === categoryKey) ||
        directionData.find((cat) => cat.category_key === "others")
      );
    }

    return directionData.find((cat) => cat.category_key === categoryKey);
  }

  getPackagingData(type) {
    return this.data?.packaging_prices?.find((pack) => pack.type === type);
  }

  getDirectionData(direction) {
    return this.data?.categories?.[direction] || null;
  }
}
