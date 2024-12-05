// Класс для работы с JSON-данными
class JsonDataLoader {
  constructor(jsonPath) {
    this.jsonPath = jsonPath;
    this.data = null;
  }

  async load() {
    try {
      const response = await fetch(this.jsonPath);
      this.data = await response.json();
      console.log("Данные успешно загружены:", this.data);
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
