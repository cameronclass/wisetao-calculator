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

// Валидация
class Validation {
  constructor(fields) {
    this.fields = fields; // Поля для валидации
    this.errors = {}; // Список ошибок
    this.setupInputRestrictions(); // Ограничение ввода
  }

  // Ограничение ввода для числовых полей
  setupInputRestrictions() {
    Object.values(this.fields).forEach((field) => {
      if (field) {
        field.addEventListener("input", () => {
          // Удаляем недопустимые символы
          field.value = field.value.replace(/[^0-9.]/g, "");
          // Удаляем лишние точки
          if ((field.value.match(/\./g) || []).length > 1) {
            field.value = field.value.replace(/\.+$/, "");
          }
          // Ограничиваем до двух знаков после точки
          const parts = field.value.split(".");
          if (parts[1]?.length > 2) {
            field.value = `${parts[0]}.${parts[1].substring(0, 2)}`;
          }
        });
      }
    });
  }

  // Проверка числового поля
  validateNumber(fieldName, options = {}) {
    const field = this.fields[fieldName];
    if (!field) return true; // Поле не существует, пропускаем

    const value = field.value.trim();
    const {
      required = false,
      min = null,
      max = null,
      decimalPlaces = 2,
    } = options;

    if (required && value === "") {
      this.addError(fieldName, "Поле обязательно для заполнения");
      return false;
    }

    const regex = new RegExp(`^\\d+(\\.\\d{0,${decimalPlaces}})?$`);
    if (value !== "" && !regex.test(value)) {
      this.addError(
        fieldName,
        `Введите число с не более ${decimalPlaces} знаками после точки`
      );
      return false;
    }

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      if (min !== null && numericValue < min) {
        this.addError(fieldName, `Значение должно быть не менее ${min}`);
        return false;
      }
      if (max !== null && numericValue > max) {
        this.addError(fieldName, `Значение должно быть не более ${max}`);
        return false;
      }
    }

    return true; // Нет ошибок
  }

  // Проверка радиокнопок
  validateRadio(fieldName) {
    const fields = document.querySelectorAll(`input[name="${fieldName}"]`);
    const isChecked = Array.from(fields).some((field) => field.checked);

    if (!isChecked) {
      this.addError(fieldName, "Необходимо выбрать один из вариантов");
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
        this.addError(field.name, "Поле должно быть больше 0");
        isValid = false;
      }
    });

    return isValid;
  }

  // Добавление ошибки
  addError(fieldName, message) {
    this.errors[fieldName] = message;
  }

  // Очистка ошибок
  clearErrors() {
    this.errors = {};
    document
      .querySelectorAll(".input-error")
      .forEach((el) => el.classList.remove("input-error"));
    document.querySelectorAll(".input-error-text").forEach((el) => el.remove());
  }

  // Отображение ошибок
  showErrors() {
    Object.keys(this.errors).forEach((fieldName) => {
      const field =
        this.fields[fieldName] ||
        document.querySelector(`input[name="${fieldName}"]`);
      if (!field) return;

      const parent = field.closest(".form-group") || field.parentElement;
      field.classList.add("input-error");

      const errorText = document.createElement("div");
      errorText.className = "input-error-text";
      errorText.textContent = this.errors[fieldName];

      parent.appendChild(errorText);
    });
  }

  clearFields(fields) {
    fields.forEach((field) => {
      if (field) field.value = ""; // Сбрасываем значение
    });
  }

  // Общая проверка всех полей
  validateAll() {
    this.clearErrors(); // Очищаем предыдущие ошибки

    const { weightVolumeChange, totalVolume } = this.fields;

    const isValid = [
      // Валидируем поле "общий объем", только если переключатель включен
      weightVolumeChange.checked
        ? this.validateNumber("totalVolume", {
            required: true,
            decimalPlaces: 2,
          })
        : true,
      this.validateNumber("totalWeight", { required: true, min: 5 }),
      this.validateNumber("quantity", { required: true, min: 1 }),
      this.validateNumber("totalCost", { required: true, decimalPlaces: 2 }),
      this.validateRadio("total_currecy"),
      this.validateRadio("category"),
      this.validateRadio("packing-type"),
      // Если переключатель выключен, проверяем длину, ширину и высоту
      !weightVolumeChange.checked ? this.validateDimensions() : true,
    ].every((result) => result);

    return isValid;
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

    const calculatedVolume = ((length * width * height) / 1000000).toFixed(2); // Перевод в м³
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
      return 0;
    }

    console.log(`Плотность: ${density}, Данные категории:`, categoryData);

    // Поиск подходящего диапазона
    const rangeData = categoryData.data.find((range) => {
      const [min, max] = range.weight_range
        .split("-")
        .map((val) => (val.includes("+") ? Infinity : parseFloat(val) || 0));

      // Если плотность ровно 100, используем диапазон >= 100, но расчет по объему
      if (density === 100) {
        return min === 100; // Берем тариф из диапазона, где min === 100
      }

      // Обычная проверка диапазонов
      return density > min && density <= max;
    });

    if (!rangeData) {
      console.error(
        `Не удалось найти подходящий тариф для указанной плотности (${density}). Проверьте JSON-данные.`
      );
      return 0;
    }

    let pricePerKg = rangeData.price_kg;

    // Учет бренда
    if (this.fields.brand.checked) {
      pricePerKg += density >= 100 ? 0.5 : 50;
    }

    console.log(
      `Тариф найден: ${pricePerKg}, Расчет ${
        density === 100 ? "по объему" : density >= 100 ? "по весу" : "по объему"
      }`
    );

    // Расчет стоимости
    if (density === 100) {
      console.log(`Расчет по объему: ${volume} * ${pricePerKg}`);
      return volume * pricePerKg;
    } else if (density > 100) {
      console.log(`Расчет по весу: ${weight} * ${pricePerKg}`);
      return weight * pricePerKg;
    } else {
      console.log(`Расчет по объему: ${volume} * ${pricePerKg}`);
      return volume * pricePerKg;
    }
  }

  // Расчет стоимости упаковки
  calculatePackagingCost(packingType, volume, quantity) {
    const packaging = this.jsonLoader.getPackagingData(packingType);
    if (!packaging) {
      console.error("Упаковка не найдена");
      return 0;
    }

    return packaging.which === "place"
      ? quantity * packaging.price
      : volume * packaging.price;
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
    if (!categoryKeyElement) {
      console.error("Категория не выбрана");
      return;
    }
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

    const shippingCost = this.calculateShippingCost(
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
      totalCostFinal
    );
  }
}

/* Курсы */
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
    ).value = `${currencyRuble} руб.`;
    document.querySelector(
      'input[name="current_rate_yuan"]'
    ).value = `${currencyYuan} юань`;
  } else {
    console.error("Не удалось получить имя группы.");
  }
})();

// Калькулятор
(async () => {
  const jsonLoader = new JsonDataLoader("../rates.json");
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
    category: document.querySelectorAll('input[name="category"]'), // Используем коллекцию
    packingType: document.querySelectorAll('input[name="packing-type"]'),
    insurance: document.querySelector('input[name="insurance"]'),
    brand: document.querySelector('input[name="brand"]'),
  };

  const calculator = new DeliveryCalculator(jsonLoader, 73.5, 10.5, fields);

  document
    .querySelector(".js-calculate-result")
    .addEventListener("click", (e) => {
      e.preventDefault();
      calculator.calculate();
    });
})();

// Поля для валидации
const fields = {
  totalVolume: document.querySelector('input[name="total_volume"]'),
  totalWeight: document.querySelector('input[name="total_weight"]'),
  quantity: document.querySelector('input[name="quantity"]'),
  totalCost: document.querySelector('input[name="total_cost"]'),
  volumeLength: document.querySelector('input[name="volume_lenght"]'),
  volumeWidth: document.querySelector('input[name="volume_width"]'),
  volumeHeight: document.querySelector('input[name="volume_height"]'),
  weightVolumeChange: document.querySelector(
    'input[name="weight_volume_change"]'
  ),
};

// Экземпляр валидации
const validation = new Validation(fields);

// Обновленный обработчик переключателя
fields.weightVolumeChange.addEventListener("change", () => {
  if (fields.weightVolumeChange.checked) {
    // Режим общего объема
    fields.totalVolume.disabled = false;
    fields.volumeLength.disabled = true;
    fields.volumeWidth.disabled = true;
    fields.volumeHeight.disabled = true;

    // Очистка полей длины, ширины и высоты
    validation.clearFields([
      fields.volumeLength,
      fields.volumeWidth,
      fields.volumeHeight,
    ]);
  } else {
    // Режим ввода габаритов
    fields.totalVolume.disabled = true;
    fields.volumeLength.disabled = false;
    fields.volumeWidth.disabled = false;
    fields.volumeHeight.disabled = false;

    // Очистка поля общего объема
    validation.clearFields([fields.totalVolume]);
  }
});

// Обработчик события на кнопку "Рассчитать"
document
  .querySelector(".js-calculate-result")
  .addEventListener("click", (e) => {
    e.preventDefault();

    if (validation.validateAll()) {
      console.log("Валидация успешна. Можно продолжить расчет.");
      // Запуск расчета
    } else {
      validation.showErrors();
      console.log("Валидация не пройдена. Исправьте ошибки.");
    }
  });
