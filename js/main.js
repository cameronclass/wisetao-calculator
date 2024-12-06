// Глобальные переменные для хранения значений
let currencyYuan; // Курс юаня
let currencyRuble; // Курс доллара в рублях

const botToken = "7077778313:AAGQu7UV0XiNs0z8aGDyQiCwaqzOEgZLnbQ"; // Ваш токен
const chatId = "-413166690"; // ID группы

// Класс для работы с Telegram API
class TelegramGroupInfo {
  constructor(botToken, chatId) {
    this.botToken = botToken; // Токен Telegram-бота
    this.chatId = chatId; // ID группы Telegram
    this.apiUrl = `https://api.telegram.org/bot${botToken}`;
  }

  // Метод для выполнения запроса к Telegram API
  async fetchChatData() {
    try {
      const response = await fetch(
        `${this.apiUrl}/getChat?chat_id=${this.chatId}`
      );
      const data = await response.json();
      if (data.ok) {
        return data.result; // Возвращает объект с данными чата
      } else {
        console.error("Ошибка API:", data.description);
        return null;
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
      return null;
    }
  }

  // Метод для получения имени группы
  async getGroupName() {
    const chatData = await this.fetchChatData();
    return chatData ? chatData.title : null; // Возвращает имя группы
  }
}

// Класс для парсинга курсов валют
class CurrencyParser {
  constructor(multiplier = 7.3) {
    this.multiplier = multiplier; // Множитель (по умолчанию 7.3)
    this.currencyYuan = null; // Средняя цена юаня
    this.currencyRuble = null; // Курс доллара в рублях
  }

  // Метод для извлечения средней цены юаня из текста
  extractYuanRate(text) {
    const match = text.match(
      /курс\s([\d.,]+)\s*\/\s*([\d.,]+)\s*\/\s*([\d.,]+)\s*ю/i
    );
    if (match) {
      this.currencyYuan = parseFloat(match[2].replace(",", ".")).toFixed(2);
    } else {
      throw new Error("Не удалось извлечь курс юаня из текста");
    }
  }

  // Метод для вычисления курса доллара в рублях
  calculateDollarRate() {
    if (this.currencyYuan !== null) {
      this.currencyRuble = (this.currencyYuan * this.multiplier).toFixed(2);
    } else {
      throw new Error("Сначала нужно извлечь курс юаня");
    }
  }

  // Главный метод: парсинг и вычисления
  parseAndCalculate(text) {
    this.extractYuanRate(text);
    this.calculateDollarRate();
  }

  // Геттеры для получения результата
  getYuanRate() {
    return this.currencyYuan;
  }

  getDollarRate() {
    return this.currencyRuble;
  }

  // Метод для обновления множителя
  updateMultiplier(newMultiplier) {
    this.multiplier = newMultiplier;
    this.calculateDollarRate();
  }
}

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

// Класс для валидации
class CalculatorValidation {
  constructor(fields) {
    this.fields = fields; // Поля для валидации
    this.errors = {}; // Список ошибок
    this.setupInputRestrictions(); // Ограничение ввода
  }

  // Ограничение ввода
  setupInputRestrictions() {
    const setupFieldRestriction = (field, regex, maxDecimals = null) => {
      field.addEventListener("input", () => {
        field.value = field.value.replace(regex, "");
        if (maxDecimals !== null) {
          const parts = field.value.split(".");
          if (parts[1]?.length > maxDecimals) {
            field.value = `${parts[0]}.${parts[1].substring(0, maxDecimals)}`;
          }
        }
      });
    };

    setupFieldRestriction(this.fields.totalVolume, /[^0-9.]/g, 4);
    setupFieldRestriction(this.fields.totalWeight, /[^0-9.]/g, 2);
    setupFieldRestriction(this.fields.totalCost, /[^0-9.]/g, 2);
    setupFieldRestriction(this.fields.quantity, /[^0-9]/g);
  }

  // Очистка значений полей
  clearFields(fields) {
    fields.forEach((field) => {
      if (field) field.value = ""; // Сбрасываем значение
    });
  }

  // Проверка числового поля
  validateNumber(fieldName, options = {}) {
    const field = this.fields[fieldName];
    if (!field) return true;

    const value = field.value.trim();
    const { required = false, min = null, maxDecimals = 2 } = options;

    if (required && value === "") {
      this.addError(field, "Поле обязательно для заполнения");
      return false;
    }

    const regex = new RegExp(`^\\d+(\\.\\d{0,${maxDecimals}})?$`);
    if (value && !regex.test(value)) {
      this.addError(
        field,
        `Введите число с не более ${maxDecimals} знаками после точки`
      );
      return false;
    }

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && min !== null && numericValue < min) {
      this.addError(field, `Значение должно быть не менее ${min}`);
      return false;
    }

    return true;
  }

  // Проверка радиокнопок
  validateRadio(fieldName) {
    const radios = document.querySelectorAll(`input[name="${fieldName}"]`);
    const isChecked = Array.from(radios).some((radio) => radio.checked);

    if (!isChecked) {
      this.addError(radios[0], "Необходимо выбрать один из вариантов");
      return false;
    }
    return true;
  }

  // Проверка длины, ширины и высоты
  validateDimensions() {
    const { volumeLength, volumeWidth, volumeHeight } = this.fields;
    let isValid = true;

    [volumeLength, volumeWidth, volumeHeight].forEach((field) => {
      const value = parseFloat(field.value.trim());
      if (isNaN(value) || value <= 0) {
        this.addError(field, "Поле должно быть больше 0");
        isValid = false;
      }
    });

    return isValid;
  }

  // Проверка радиокнопок категории
  validateCategory() {
    const radios = document.querySelectorAll('input[name="category"]');
    const isChecked = Array.from(radios).some((radio) => radio.checked);

    const errorSpan = document.querySelector(".error-message-category");
    const errorBlock = document.querySelector(".js-error-category");

    if (!isChecked) {
      if (errorSpan) errorSpan.textContent = "Необходимо выбрать категорию";
      if (errorBlock) errorBlock.classList.add("active");
      return false;
    }

    // Очищаем ошибки, если категория выбрана
    if (errorSpan) errorSpan.textContent = "";
    if (errorBlock) errorBlock.classList.remove("active");

    return true;
  }

  // Добавление ошибки
  addError(field, message) {
    const parent = field.closest(".form-group") || field.parentElement;
    const errorSpan = parent.querySelector(".error-message");
    if (errorSpan) errorSpan.textContent = message;
    field.classList.add("error-input");
  }

  // Очистка ошибок
  clearErrors() {
    this.errors = {};
    document
      .querySelectorAll(".error-input")
      .forEach((el) => el.classList.remove("error-input"));
    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
    });
  }

  // Общая проверка всех полей
  validateAll() {
    this.clearErrors();

    const { weightVolumeChange } = this.fields;
    const isValid = [
      weightVolumeChange.checked
        ? this.validateNumber("totalVolume", { required: true, maxDecimals: 4 })
        : this.validateDimensions(),
      this.validateNumber("totalWeight", {
        required: true,
        min: 5,
        maxDecimals: 2,
      }),
      this.validateNumber("quantity", { required: true }),
      this.validateNumber("totalCost", { required: true, maxDecimals: 2 }),
      this.validateRadio("total_currecy"),
      this.validateCategory(), // Добавлена проверка категории
      this.validateRadio("packing-type"),
    ].every((result) => result);

    return isValid;
  }
}

// Основной класс калькулятора
class DeliveryCalculator {
  constructor(jsonLoader, currencyRuble, currencyYuan, fields) {
    this.jsonLoader = jsonLoader;
    this.currencyRuble = currencyRuble;
    this.currencyYuan = currencyYuan;
    this.fields = fields;

    this.initEventListeners();
    this.setupNumericInputRestrictions();
  }

  // Инициализация событий
  initEventListeners() {
    const { weightVolumeChange, volumeLength, volumeWidth, volumeHeight } =
      this.fields;

    // Обработчик переключателя режима объема
    weightVolumeChange.addEventListener("change", () => {
      this.toggleVolumeMode();
    });

    // Обработчики изменения длины, ширины и высоты
    [volumeLength, volumeWidth, volumeHeight].forEach((field) => {
      field.addEventListener("input", () => {
        this.calculateVolume();
      });
    });
  }

  // Ограничение ввода в числовые поля
  setupNumericInputRestrictions() {
    const numericFields = [
      this.fields.volumeLength,
      this.fields.volumeWidth,
      this.fields.volumeHeight,
    ];

    numericFields.forEach((field) => {
      field.addEventListener("input", () => {
        // Удаляем все символы, кроме цифр и точки
        field.value = field.value.replace(/[^0-9.]/g, "");

        // Убираем лишние точки
        const parts = field.value.split(".");
        if (parts.length > 2) {
          field.value = parts[0] + "." + parts.slice(1).join("");
        }

        // Ограничение до 2 знаков после точки
        if (parts[1]?.length > 2) {
          field.value = `${parts[0]}.${parts[1].substring(0, 2)}`;
        }
      });
    });
  }

  // Переключение режима ввода объема
  toggleVolumeMode() {
    const {
      weightVolumeChange,
      totalVolume,
      volumeLength,
      volumeWidth,
      volumeHeight,
      totalVolumeCalculated,
    } = this.fields;

    if (weightVolumeChange.checked) {
      totalVolume.disabled = false;
      volumeLength.disabled = true;
      volumeWidth.disabled = true;
      volumeHeight.disabled = true;
      totalVolumeCalculated.value = ""; // Сбрасываем расчетный объем
      totalVolumeCalculated.disabled = true;
    } else {
      totalVolume.disabled = true;
      volumeLength.disabled = false;
      volumeWidth.disabled = false;
      volumeHeight.disabled = false;
      totalVolumeCalculated.disabled = false; // Включаем расчетный объем
    }
  }

  // Вычисление объема
  calculateVolume() {
    const { volumeLength, volumeWidth, volumeHeight, totalVolumeCalculated } =
      this.fields;

    const length = parseFloat(volumeLength.value) || 0;
    const width = parseFloat(volumeWidth.value) || 0;
    const height = parseFloat(volumeHeight.value) || 0;

    // Перевод в м³ и отображение до 4 знаков после точки
    const calculatedVolume = ((length * width * height) / 1000000).toFixed(4);
    totalVolumeCalculated.value = calculatedVolume > 0 ? calculatedVolume : "";
  }

  // Конвертация в доллары
  convertToDollar(totalCost, selectedCurrency) {
    if (selectedCurrency === "ruble") {
      return (totalCost / this.currencyRuble).toFixed(2);
    } else if (selectedCurrency === "yuan") {
      return (totalCost / this.currencyYuan).toFixed(2);
    }
    return totalCost.toFixed(2);
  }

  // Вычисление плотности
  calculateDensity(totalWeight, totalVolume) {
    if (totalVolume > 0) {
      const density = (totalWeight / totalVolume).toFixed(2);
      console.log(`Рассчитанная плотность: ${density}`);
      return density;
    }
    console.error("Объем должен быть больше нуля");
    return null;
  }

  // Расчет стоимости доставки
  calculateShippingCost(categoryKey, density, weight, volume) {
    const categoryData = this.jsonLoader.getCategoryData(categoryKey);
    if (!categoryData) {
      console.error("Категория не найдена");
      return { cost: 0, pricePerKg: 0, calculationMode: null };
    }

    console.log(`Плотность: ${density}, Данные категории:`, categoryData);

    const rangeData = categoryData.data.find((range) => {
      const rangeParts = range.weight_range.split("-");
      const min = parseFloat(rangeParts[0]) || 0;
      const max =
        rangeParts.length > 1
          ? parseFloat(rangeParts[1]) || Infinity
          : Infinity;
      return density >= min && density <= max;
    });

    if (!rangeData) {
      console.error(
        `Не удалось найти подходящий тариф для указанной плотности (${density}). Проверьте JSON-данные.`
      );
      return { cost: 0, pricePerKg: 0, calculationMode: null };
    }

    let pricePerKg = rangeData.price_kg;

    // Учет бренда
    if (this.fields.brand.checked) {
      pricePerKg += density >= 100 ? 0.5 : 50;
    }

    const calculationMode = density >= 100 ? "weight" : "volume";
    const cost =
      calculationMode === "weight" ? weight * pricePerKg : volume * pricePerKg;

    console.log(
      `Тариф найден: ${pricePerKg}, Расчет ${
        calculationMode === "weight" ? "по весу" : "по объему"
      }`
    );

    return { cost, pricePerKg, calculationMode };
  }

  // Расчет стоимости упаковки
  calculatePackagingCost(packingType, volume, quantity) {
    const packaging = this.jsonLoader.getPackagingData(packingType);
    if (!packaging) {
      console.error("Упаковка не найдена");
      return 0;
    }

    const standardPackaging = this.jsonLoader.getPackagingData("std_pack");
    if (!standardPackaging) {
      console.error("Стандартная упаковка не найдена");
      return 0;
    }

    const packagingCost =
      packaging.which === "place"
        ? quantity * packaging.price
        : volume * packaging.price;

    const standardPackagingCost =
      standardPackaging.which === "place"
        ? quantity * standardPackaging.price
        : volume * standardPackaging.price;

    // Добавляем стоимость стандартной упаковки, если выбрано не стандартное
    return (
      packagingCost + (packingType === "std_pack" ? 0 : standardPackagingCost)
    );
  }

  // Расчет страховки
  calculateInsuranceCost(shippingCost, totalCost) {
    return this.fields.insurance.checked
      ? (shippingCost + totalCost) * 0.02
      : 0;
  }

  // Итоговый расчет стоимости
  calculateTotalCost(shippingCost, packagingCost, insuranceCost) {
    return shippingCost + packagingCost + insuranceCost;
  }

  // Обновление результатов в интерфейсе
  updateResults(
    shippingCost,
    packagingCost,
    insuranceCost,
    totalCost,
    pricePerKg,
    calculationMode
  ) {
    const totalCostRuble = totalCost * this.currencyRuble;

    // Общая стоимость в долларах и рублях
    document.querySelector(".calculate-result__dollar").textContent =
      totalCost.toFixed(2);
    document.querySelector(".calculate-result__ruble").textContent =
      totalCostRuble.toFixed(2);

    // Тариф за кг или за м³
    document.querySelector(".calculate-result__kg").textContent =
      pricePerKg.toFixed(2);
    document.querySelector(".calculate-result__kg_ruble").textContent = (
      pricePerKg * this.currencyRuble
    ).toFixed(2);

    // Тип тарифа
    const titleTariff = document.querySelector(
      ".calculate-result__title_tarif"
    );
    if (calculationMode === "weight") {
      titleTariff.textContent = "За КГ:";
    } else if (calculationMode === "volume") {
      titleTariff.textContent = "За м/3:";
    } else {
      titleTariff.textContent = "";
    }
  }

  // Основной метод расчета
  async calculate() {
    const totalCost = parseFloat(this.fields.totalCost.value);
    const totalWeight = parseFloat(this.fields.totalWeight.value);
    const totalVolume = this.fields.weightVolumeChange.checked
      ? parseFloat(this.fields.totalVolume.value)
      : parseFloat(this.fields.totalVolumeCalculated.value);
    const selectedCurrency = document.querySelector(
      'input[name="total_currecy"]:checked'
    ).value;

    const categoryKeyElement = Array.from(this.fields.category).find(
      (field) => field.checked
    );

    const categoryKey = categoryKeyElement.value;

    const packingType = document.querySelector(
      'input[name="packing-type"]:checked'
    ).value;

    if (!packingType || !totalCost || !totalWeight || !totalVolume) {
      console.error("Не все поля заполнены корректно");
      return;
    }

    const costInDollar = parseFloat(
      this.convertToDollar(totalCost, selectedCurrency)
    );
    const density = this.calculateDensity(totalWeight, totalVolume);

    const {
      cost: shippingCost,
      pricePerKg,
      calculationMode,
    } = this.calculateShippingCost(
      categoryKey,
      density,
      totalWeight,
      totalVolume
    );

    const packagingCost = this.calculatePackagingCost(
      packingType,
      totalVolume,
      parseInt(this.fields.quantity.value, 10)
    );
    const insuranceCost = this.calculateInsuranceCost(
      shippingCost,
      costInDollar
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
      totalCostFinal,
      pricePerKg,
      calculationMode
    );
  }
}

// Основной код калькулятора
(async () => {
  // 1. Получаем имя группы через Telegram API
  const groupInfo = new TelegramGroupInfo(botToken, chatId);
  const groupName = await groupInfo.getGroupName();

  if (groupName) {
    const currencyParser = new CurrencyParser(); // Создаём объект парсера
    currencyParser.parseAndCalculate(groupName); // Парсим имя группы

    // Получаем результаты
    currencyYuan = currencyParser.getYuanRate(); // Средняя цена юаня
    currencyRuble = currencyParser.getDollarRate(); // Курс доллара в рублях

    console.log(`1$ = ${currencyYuan} юань`);
    console.log(`1$ = ${currencyRuble} рубль`);

    // Обновляем поля в HTML
    document.querySelector(
      'input[name="current_rate_ruble"]'
    ).value = `${currencyRuble}`;
    document.querySelector(
      'input[name="current_rate_yuan"]'
    ).value = `${currencyYuan}`;
  } else {
    console.error("Не удалось получить имя группы.");
  }

  const jsonLoader = new JsonDataLoader("rates.json");
  await jsonLoader.load();

  const fields = {
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
    brand: document.querySelector('input[name="brand"]'),
  };

  const calculator = new DeliveryCalculator(
    jsonLoader,
    currencyRuble,
    currencyYuan,
    fields
  );
  const validation = new CalculatorValidation(fields);

  if (!currencyRuble || !currencyYuan) {
    console.error("Курсы валют не загружены, расчет невозможен.");
    return;
  }

  fields.weightVolumeChange.addEventListener("change", () => {
    if (fields.weightVolumeChange.checked) {
      fields.totalVolume.disabled = false;
      fields.volumeLength.disabled = true;
      fields.volumeWidth.disabled = true;
      fields.volumeHeight.disabled = true;

      validation.clearErrors(); // Очищаем ошибки
      validation.clearFields([
        fields.volumeLength,
        fields.volumeWidth,
        fields.volumeHeight,
      ]); // Очищаем поля длины, ширины и высоты
    } else {
      fields.totalVolume.disabled = true;
      fields.volumeLength.disabled = false;
      fields.volumeWidth.disabled = false;
      fields.volumeHeight.disabled = false;

      validation.clearErrors(); // Очищаем ошибки
      validation.clearFields([fields.totalVolume]); // Очищаем поле общего объема
    }
  });

  document
    .querySelector(".js-calculate-result")
    .addEventListener("click", (e) => {
      e.preventDefault();
      if (validation.validateAll()) {
        calculator.calculate();
        document.querySelector(".main-calc-result").classList.add("active");
      } else {
        console.error("Валидация не пройдена.");
      }
    });
})();
