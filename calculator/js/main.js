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
  constructor(jsonLoader, currencyRuble, currencyYuan) {
    this.jsonLoader = jsonLoader;
    this.currencyRuble = currencyRuble;
    this.currencyYuan = currencyYuan;

    // Переменные для полей ввода
    this.fields = {
      totalCost: document.querySelector('input[name="total_cost"]'),
      totalWeight: document.querySelector('input[name="total_weight"]'),
      totalVolume: document.querySelector('input[name="total_volume"]'),
      totalVolumeCalculated: document.querySelector(
        'input[name="total_volume_calculated"]'
      ),
      volumeLength: document.querySelector('input[name="volume_lenght"]'),
      volumeWidth: document.querySelector('input[name="volume_width"]'),
      volumeHeight: document.querySelector('input[name="volume_height"]'),
      weightVolumeChange: document.querySelector(
        'input[name="weight_volume_change"]'
      ),
      quantity: document.querySelector('input[name="quantity"]'),
      category: document.querySelectorAll('input[name="category"]'),
      packingType: document.querySelectorAll('input[name="packing-type"]'),
      insurance: document.querySelector('input[name="insurance"]'),
      currency: document.querySelectorAll('input[name="total_currecy"]'),
      brand: document.querySelector('input[name="brand"]'),
    };

    this.initEventListeners();
  }

  // Инициализация событий
  initEventListeners() {
    const { weightVolumeChange, volumeLength, volumeWidth, volumeHeight } =
      this.fields;

    // Обработчик переключателя
    weightVolumeChange.addEventListener("change", () => {
      const { totalVolume, totalVolumeCalculated } = this.fields;

      if (weightVolumeChange.checked) {
        // Если включен режим ввода общего объема
        totalVolume.disabled = false;
        volumeLength.disabled = true;
        volumeWidth.disabled = true;
        volumeHeight.disabled = true;
        totalVolumeCalculated.value = ""; // Сбрасываем расчетное значение
        totalVolumeCalculated.disabled = true;
      } else {
        // Если включен режим ввода габаритов
        totalVolume.disabled = true;
        volumeLength.disabled = false;
        volumeWidth.disabled = false;
        volumeHeight.disabled = false;
        totalVolumeCalculated.disabled = true; // Поле для результата неактивно, но обновляется
      }
    });

    // Обработчики изменения длины, ширины и высоты
    [volumeLength, volumeWidth, volumeHeight].forEach((field) => {
      field.addEventListener("input", () => {
        this.calculateVolume();
      });
    });
  }

  // Вычисление объема
  calculateVolume() {
    const { volumeLength, volumeWidth, volumeHeight, totalVolumeCalculated } =
      this.fields;

    const length = parseFloat(volumeLength.value) || 0;
    const width = parseFloat(volumeWidth.value) || 0;
    const height = parseFloat(volumeHeight.value) || 0;

    const calculatedVolume = ((length * width * height) / 1000000).toFixed(2); // Перевод в м³
    totalVolumeCalculated.value = calculatedVolume;
  }

  // Конвертация в доллары
  convertToDollar(totalCost, selectedCurrency) {
    let convertedCost = totalCost;

    if (selectedCurrency === "ruble") {
      convertedCost = totalCost / this.currencyRuble;
    } else if (selectedCurrency === "yuan") {
      convertedCost = totalCost / this.currencyYuan;
    }

    return convertedCost.toFixed(2);
  }

  // Вычисление плотности
  calculateDensity(totalWeight, totalVolume) {
    if (totalVolume > 0) {
      return (totalWeight / totalVolume).toFixed(2);
    }
    console.error("Объем должен быть больше нуля");
    return null;
  }

  // Расчет стоимости доставки с учетом бренда
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

    // Учет бренда
    const isBrandChecked = this.fields.brand.checked; // Поле "brand"
    if (isBrandChecked) {
      if (density >= 100) {
        pricePerKg += 0.5; // Для плотности >= 100
      } else {
        pricePerKg += 50; // Для плотности < 100
      }
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
      totalCost * this.currencyRuble
    ).toFixed(2);
    document.querySelector(".calculate-result__cny").textContent = (
      totalCost * this.currencyYuan
    ).toFixed(2);
  }

  // Основной расчет
  async calculate() {
    if (!validateFields()) {
      console.error("Ошибка валидации");
      return;
    }

    const {
      totalCost,
      currency,
      totalWeight,
      totalVolume,
      totalVolumeCalculated,
      weightVolumeChange,
      quantity,
      insurance,
    } = this.fields;

    const costValue = parseFloat(totalCost.value);
    const selectedCurrency = document.querySelector(
      'input[name="total_currecy"]:checked'
    ).value;

    const totalCostInDollars = parseFloat(
      this.convertToDollar(costValue, selectedCurrency)
    );
    console.log(`Общая стоимость в долларах: ${totalCostInDollars}`);

    const totalVolumeValue = weightVolumeChange.checked
      ? parseFloat(totalVolume.value)
      : parseFloat(totalVolumeCalculated.value);

    const density = this.calculateDensity(
      parseFloat(totalWeight.value),
      totalVolumeValue
    );
    if (!density) return;

    const categoryKey = document.querySelector(
      'input[name="category"]:checked'
    ).value;
    const packingType = document.querySelector(
      'input[name="packing-type"]:checked'
    ).value;

    const shippingCost = this.calculateShippingCost(
      categoryKey,
      density,
      parseFloat(totalWeight.value),
      totalVolumeValue
    );
    const packagingCost = this.calculatePackagingCost(
      packingType,
      totalVolumeValue,
      parseInt(quantity.value, 10)
    );
    const insuranceCost = this.calculateInsuranceCost(
      shippingCost,
      totalCostInDollars,
      insurance.checked
    );

    const totalCostFinal = this.calculateTotalCost(
      shippingCost,
      packagingCost,
      insuranceCost
    );
    this.updateResults(
      shippingCost,
      packagingCost,
      insuranceCost,
      totalCostFinal
    );
  }
}

// Основной код
(async () => {
  const jsonLoader = new JsonDataLoader("rates.json");
  await jsonLoader.load();

  const calculator = new DeliveryCalculator(
    jsonLoader,
    currencyRuble,
    currencyYuan
  );

  document
    .querySelector(".js-calculate-result")
    .addEventListener("click", (e) => {
      e.preventDefault();
      calculator.calculate();
    });
})();
