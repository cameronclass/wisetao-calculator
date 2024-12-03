class JsonDataLoader {
  constructor(jsonPath, localStorageKey = "calculatorData") {
    this.jsonPath = jsonPath;
    this.localStorageKey = localStorageKey;
    this.data = null;
  }

  async load() {
    const cachedData = this.getCachedData();
    if (cachedData) {
      this.data = cachedData;
      console.log("Данные загружены из localStorage:", this.data);
    }

    const isUpdated = await this.checkForUpdates();
    if (isUpdated || !cachedData) {
      console.log("Обновление данных...");
      await this.fetchData();
    }
  }

  getCachedData() {
    const stored = localStorage.getItem(this.localStorageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Ошибка при чтении кэша:", error);
      }
    }
    return null;
  }

  async checkForUpdates() {
    try {
      const response = await fetch(this.jsonPath, { method: "HEAD" });
      const serverLastModified = response.headers.get("Last-Modified");
      const cachedLastModified = localStorage.getItem(
        `${this.localStorageKey}-lastModified`
      );

      if (serverLastModified !== cachedLastModified) {
        localStorage.setItem(
          `${this.localStorageKey}-lastModified`,
          serverLastModified
        );
        return true;
      }
    } catch (error) {
      console.warn("Ошибка проверки обновлений:", error);
    }
    return false;
  }

  async fetchData() {
    try {
      const response = await fetch(this.jsonPath);
      this.data = await response.json();
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error("Ошибка загрузки JSON:", error);
    }
  }

  getCategoryData(categoryKey) {
    return this.data?.categories.find(
      (cat) => cat.category_key === categoryKey
    );
  }

  getPackagingData(type) {
    return this.data?.packaging_prices.find((pack) => pack.type === type);
  }
}

export default JsonDataLoader;
