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
    return this.data.categories.find((cat) => cat.category_key === categoryKey);
  }

  getPackagingData(type) {
    return this.data.packaging_prices.find((pack) => pack.type === type);
  }
}

// Основной класс калькулятора
class DeliveryCalculator {
  constructor(jsonLoader, currencyDollar, currencyYuan) {
    this.jsonLoader = jsonLoader;
    this.currencyDollar = currencyDollar;
    this.currencyYuan = currencyYuan;
  }

  // Вычисление плотности
  calculateDensity(totalWeight, totalVolume) {
    if (totalVolume > 0) {
      return (totalWeight / totalVolume).toFixed(2);
    }
    console.error("Объем должен быть больше нуля");
    return null;
  }

  // Расчет стоимости доставки
  calculateShippingCost(categoryKey, density, totalWeight, totalVolume) {
    const categoryData = this.jsonLoader.getCategoryData(categoryKey);
    if (!categoryData) {
      console.error("Категория не найдена");
      return 0;
    }

    let pricePerKg = null;
    categoryData.data.forEach((range) => {
      const [min, max] = range.weight_range
        .split("-")
        .map((val) => (val.includes("+") ? Infinity : parseFloat(val)));
      if (density >= min && density <= max) {
        pricePerKg = range.price_kg;
      }
    });

    if (pricePerKg === null) {
      console.error(
        "Не удалось найти подходящий тариф для указанной плотности"
      );
      return 0;
    }

    return density >= 100 ? totalWeight * pricePerKg : totalVolume * pricePerKg;
  }

  // Расчет стоимости упаковки
  calculatePackagingCost(packingType, totalVolume, quantity) {
    const packaging = this.jsonLoader.getPackagingData(packingType);
    if (!packaging) {
      console.error("Упаковка не найдена");
      return 0;
    }

    if (packaging.which === "place") {
      return quantity * packaging.price;
    }
    return totalVolume * packaging.price;
  }

  // Расчет страховки
  calculateInsuranceCost(shippingCost, totalCost, isInsured) {
    if (isInsured) {
      return (shippingCost + totalCost) * 0.02; // 2% страховка
    }
    return 0;
  }

  // Расчет итоговой стоимости
  calculateTotalCost(shippingCost, packagingCost, insuranceCost) {
    return shippingCost + packagingCost + insuranceCost;
  }

  // Обновление результатов в интерфейсе
  updateResults(shippingCost, packagingCost, insuranceCost, totalCost) {
    document.querySelector(".calculate-result__ship").textContent =
      shippingCost.toFixed(2);
    document.querySelector(".calculate-result__package").textContent =
      packagingCost.toFixed(2);
    document.querySelector(".calculate-result__insurance").textContent =
      insuranceCost.toFixed(2);
    document.querySelector(".calculate-result__dollar").textContent =
      totalCost.toFixed(2);
    document.querySelector(".calculate-result__ruble").textContent = (
      totalCost * this.currencyDollar
    ).toFixed(2);
    document.querySelector(".calculate-result__cny").textContent = (
      totalCost * this.currencyYuan
    ).toFixed(2);
  }

  // Основной расчет
  async calculate() {
    // Проверка валидации
    if (!validateFields()) {
      console.error("Ошибка валидации");
      return;
    }

    // Получение данных из полей
    const totalWeight = parseFloat(
      document.querySelector('input[name="total_weight"]').value
    );
    const totalVolumeField = document.querySelector(
      'input[name="total_volume"]'
    );
    const totalVolumeCalculatedField = document.querySelector(
      'input[name="total_volume_calculated"]'
    );
    const isVolumeCalculated = !document.querySelector(
      'input[name="weight_volume_change"]'
    ).checked;

    const totalVolume = isVolumeCalculated
      ? parseFloat(totalVolumeCalculatedField.value)
      : parseFloat(totalVolumeField.value);

    const categoryKey = document.querySelector(
      'input[name="category"]:checked'
    ).value;
    const packingType = document.querySelector(
      'input[name="packing-type"]:checked'
    ).value;
    const quantity = parseInt(
      document.querySelector('input[name="quantity"]').value,
      10
    );
    const totalCostField = parseFloat(
      document.querySelector('input[name="total_cost"]').value
    );
    const isInsured = document.querySelector('input[name="insurance"]').checked;

    // Вычисление плотности
    const density = this.calculateDensity(totalWeight, totalVolume);
    if (!density) return;

    // Расчет стоимости доставки
    const shippingCost = this.calculateShippingCost(
      categoryKey,
      density,
      totalWeight,
      totalVolume
    );

    // Расчет стоимости упаковки
    const packagingCost = this.calculatePackagingCost(
      packingType,
      totalVolume,
      quantity
    );

    // Расчет страховки
    const insuranceCost = this.calculateInsuranceCost(
      shippingCost,
      totalCostField,
      isInsured
    );

    // Итоговая стоимость
    const totalCost = this.calculateTotalCost(
      shippingCost,
      packagingCost,
      insuranceCost
    );

    // Обновление интерфейса
    this.updateResults(shippingCost, packagingCost, insuranceCost, totalCost);
  }
}

// Основной код
(async () => {
  const jsonLoader = new JsonDataLoader("rates.json");
  await jsonLoader.load();

  const calculator = new DeliveryCalculator(
    jsonLoader,
    currencyDollar,
    currencyYuan
  );

  document
    .querySelector(".js-calculate-result")
    .addEventListener("click", (e) => {
      e.preventDefault();
      calculator.calculate();
    });
})();
