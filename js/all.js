export class TelegramGroupInfo {
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

export class CurrencyParser {
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
      console.log("Данные успешно загружены с сервера:", this.data);

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

// project/src/data/State.js
export const State = {
  directionsData: {
    // Будем хранить данные по направлениям: auto, train, avia
  },

  /**
   * Сохраняет данные для указанного направления.
   * @param {string} direction - 'auto' | 'train' | 'avia'
   * @param {object} data - Объект с данными расчетов для данного направления.
   */
  setDirectionData(direction, data) {
    this.directionsData[direction] = data;
  },

  /**
   * Возвращает данные для указанного направления.
   * @param {string} direction - 'auto' | 'train' | 'avia'
   * @returns {object|null} Объект с данными или null, если нет данных.
   */
  getDirectionData(direction) {
    return this.directionsData[direction] || null;
  },
};

export class CalculatorValidation {
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

  clearFields(fields) {
    fields.forEach((field) => {
      if (field) field.value = ""; // Сбрасываем значение
    });
  }

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

  validateRadio(fieldName) {
    const radios = document.querySelectorAll(`input[name="${fieldName}"]`);
    const isChecked = Array.from(radios).some((radio) => radio.checked);

    if (!isChecked) {
      this.addError(radios[0], "Необходимо выбрать один из вариантов");
      return false;
    }
    return true;
  }

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

    if (errorSpan) errorSpan.textContent = "";
    if (errorBlock) errorBlock.classList.remove("active");

    return true;
  }

  addError(field, message) {
    const parent = field.closest(".form-group") || field.parentElement;
    const errorSpan = parent.querySelector(".error-message");
    if (errorSpan) errorSpan.textContent = message;
    field.classList.add("error-input");
  }

  clearErrors() {
    this.errors = {};
    document
      .querySelectorAll(".error-input")
      .forEach((el) => el.classList.remove("error-input"));
    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
    });
  }

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
      this.validateCategory(),
      this.validateRadio("packing-type"),
    ].every((result) => result);

    return isValid;
  }
}

// DeliveryCalculator.js
import { CONFIG } from "../config.js";
import { UIController } from "../ui/UIController.js";

export class DeliveryCalculator {
  constructor(jsonLoader, currencyRuble, currencyYuan, fields) {
    this.jsonLoader = jsonLoader;
    this.currencyRuble = currencyRuble;
    this.currencyYuan = currencyYuan;
    this.fields = fields;
    this.initEventListeners();
    this.setupNumericInputRestrictions();
  }

  initEventListeners() {
    const { weightVolumeChange, volumeLength, volumeWidth, volumeHeight } =
      this.fields;

    weightVolumeChange.addEventListener("change", () => {
      this.toggleVolumeMode();
    });

    [volumeLength, volumeWidth, volumeHeight].forEach((field) => {
      field.addEventListener("input", () => {
        this.calculateVolume();
      });
    });
  }

  setupNumericInputRestrictions() {
    const numericFields = [
      this.fields.volumeLength,
      this.fields.volumeWidth,
      this.fields.volumeHeight,
    ];

    numericFields.forEach((field) => {
      field.addEventListener("input", () => {
        field.value = field.value.replace(/[^0-9.]/g, "");
        const parts = field.value.split(".");
        if (parts.length > 2) {
          field.value = parts[0] + "." + parts.slice(1).join("");
        }
        if (parts[1]?.length > 2) {
          field.value = `${parts[0]}.${parts[1].substring(0, 2)}`;
        }
      });
    });
  }

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
      totalVolumeCalculated.value = "";
      totalVolumeCalculated.disabled = true;
    } else {
      totalVolume.disabled = true;
      volumeLength.disabled = false;
      volumeWidth.disabled = false;
      volumeHeight.disabled = false;
      totalVolumeCalculated.disabled = false;
    }
  }

  calculateVolume() {
    const { volumeLength, volumeWidth, volumeHeight, totalVolumeCalculated } =
      this.fields;

    const length = parseFloat(volumeLength.value) || 0;
    const width = parseFloat(volumeWidth.value) || 0;
    const height = parseFloat(volumeHeight.value) || 0;

    const calculatedVolume = ((length * width * height) / 1000000).toFixed(4);
    totalVolumeCalculated.value = calculatedVolume > 0 ? calculatedVolume : "";
  }

  convertToDollar(totalCost, selectedCurrency) {
    if (selectedCurrency === "ruble") {
      return (totalCost / this.currencyRuble).toFixed(2);
    } else if (selectedCurrency === "yuan") {
      return (totalCost / this.currencyYuan).toFixed(2);
    }
    return totalCost.toFixed(2);
  }

  calculateDensity(totalWeight, totalVolume) {
    if (totalVolume > 0) {
      return (totalWeight / totalVolume).toFixed(2);
    }
    UIController.showError("Объем должен быть больше нуля");
    return null;
  }

  calculateShippingCostForDirection(
    direction,
    categoryKey,
    density,
    weight,
    volume
  ) {
    const directionData = this.jsonLoader.getDirectionData(direction);
    if (!directionData) {
      UIController.showError(
        `Данные для направления "${direction}" не найдены.`
      );
      return { cost: 0, pricePerKg: 0, calculationMode: null };
    }

    let calculationMode = null;
    let rangeData = null;

    if (direction === "train") {
      rangeData = directionData.find((range) => {
        const [min, max] = range.weight_range
          .split("-")
          .map((val) => (val === "" ? Infinity : parseFloat(val) || 0));
        return density >= min && density <= max;
      });
      calculationMode = density >= 200 ? "weight" : "volume";
    } else if (direction === "avia") {
      const categoryData =
        directionData.find((cat) => cat.category_key === categoryKey) ||
        directionData.find((cat) => cat.category_key === "others");

      rangeData = categoryData?.data?.find((range) => {
        const [min, max] = range.weight_range
          .split("-")
          .map((val) => (val === "" ? Infinity : parseFloat(val) || 0));
        return density >= min && density <= max;
      });
      calculationMode = density >= 100 ? "weight" : "volume";
    } else {
      const categoryData = directionData.find(
        (cat) => cat.category_key === categoryKey
      );
      rangeData = categoryData?.data?.find((range) => {
        const [min, max] = range.weight_range
          .split("-")
          .map((val) => (val === "" ? Infinity : parseFloat(val) || 0));
        return density >= min && density <= max;
      });
      calculationMode = density >= 100 ? "weight" : "volume";
    }

    if (!rangeData) {
      UIController.showError(
        `Не удалось найти подходящий тариф для направления ${direction} и плотности ${density}.`
      );
      return { cost: 0, pricePerKg: 0, calculationMode: null };
    }

    let pricePerKg = rangeData.price_kg;
    if (this.fields.brand && this.fields.brand.checked) {
      pricePerKg += density >= 100 ? 0.5 : 50;
    }

    const cost =
      calculationMode === "weight" ? weight * pricePerKg : volume * pricePerKg;
    return { cost, pricePerKg, calculationMode };
  }

  calculatePackagingCost(packingType, volume, quantity) {
    const packaging = this.jsonLoader.getPackagingData(packingType);
    if (!packaging) {
      UIController.showError("Упаковка не найдена");
      return 0;
    }

    const standardPackaging = this.jsonLoader.getPackagingData("std_pack");
    if (!standardPackaging) {
      UIController.showError("Стандартная упаковка не найдена");
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

    return (
      packagingCost + (packingType === "std_pack" ? 0 : standardPackagingCost)
    );
  }

  calculateInsuranceCost(shippingCost, totalCost) {
    return this.fields.insurance.checked
      ? (shippingCost + totalCost) * CONFIG.insuranceRate
      : 0;
  }

  calculateTotalCost(shippingCost, packagingCost, insuranceCost) {
    return shippingCost + packagingCost + insuranceCost;
  }

  async calculate() {
    try {
      const totalCost = parseFloat(this.fields.totalCost.value) || 0;
      const totalWeight = parseFloat(this.fields.totalWeight.value) || 0;
      const totalVolume = this.fields.weightVolumeChange.checked
        ? parseFloat(this.fields.totalVolume.value) || 0
        : parseFloat(this.fields.totalVolumeCalculated.value) || 0;

      const selectedCurrencyElement = document.querySelector(
        'input[name="total_currecy"]:checked'
      );
      const selectedCurrency = selectedCurrencyElement
        ? selectedCurrencyElement.value
        : "dollar";

      const costInDollar = parseFloat(
        this.convertToDollar(totalCost, selectedCurrency)
      );
      const categoryKeyElement = Array.from(this.fields.category).find(
        (field) => field.checked
      );

      if (!categoryKeyElement) {
        UIController.showError("Категория не выбрана!");
        return;
      }

      const categoryKey = categoryKeyElement.value;
      const packingType = document.querySelector(
        'input[name="packing-type"]:checked'
      )?.value;
      if (!packingType) {
        UIController.showError("Упаковка не выбрана!");
        return;
      }

      const density = this.calculateDensity(totalWeight, totalVolume);
      if (!density) {
        return; // Ошибка уже показана
      }

      const directions = ["auto", "train", "avia"];
      const results = directions.map((direction) => {
        const result = this.calculateShippingCostForDirection(
          direction,
          categoryKey,
          density,
          totalWeight,
          totalVolume
        );
        return result;
      });

      const packagingCost = this.calculatePackagingCost(
        packingType,
        totalVolume,
        parseInt(this.fields.quantity.value, 10)
      );

      // Обновление UI с результатами
      UIController.showResults(results, {
        totalCost,
        selectedCurrency,
        costInDollar,
        totalVolume,
        totalWeight,
        quantity: parseInt(this.fields.quantity.value, 10),
        density,
        categoryKey,
        packagingCost,
        currencyRuble: this.currencyRuble,
        brandIncluded: this.fields.brand?.checked,
        packingTypeValue: packingType,
        calculateInsuranceCost: this.calculateInsuranceCost.bind(this),
        calculateTotalCost: this.calculateTotalCost.bind(this),
      });
    } catch (error) {
      UIController.showError(
        "Произошла непредвиденная ошибка при расчёте: " + error.message
      );
      console.error(error);
    }
  }
}

import { State } from "../data/State.js";

// uiController.js
export class UIController {
  static showError(message) {
    const errorBox = document.querySelector(".error-box");
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.classList.add("active");
    }
    console.error(message);
  }

  static clearError() {
    const errorBox = document.querySelector(".error-box");
    if (errorBox) {
      errorBox.textContent = "";
      errorBox.classList.remove("active");
    }
  }

  static showResults(
    results,
    {
      totalCost,
      selectedCurrency,
      costInDollar,
      totalVolume,
      totalWeight,
      quantity,
      density,
      categoryKey,
      packagingCost,
      currencyYuan,
      currencyRuble,
      brandIncluded,
      packingTypeValue,
      calculateInsuranceCost,
      calculateTotalCost,
    }
  ) {
    const directionKeys = ["auto", "train", "avia"];
    results.forEach((res, idx) => {
      const directionName = directionKeys[idx]; // 'auto', 'train' или 'avia'
      const calculationMode =
        res?.calculationMode === "weight" ? "по килограммам" : "по объему";

      const shippingCostDollar = (res?.cost || 0).toFixed(2);

      let pricePerKgDollar, pricePerKgRuble;
      if (calculationMode === "по объему") {
        const shippingCostInDollarNum = parseFloat(shippingCostDollar);
        pricePerKgDollar = (shippingCostInDollarNum / totalWeight).toFixed(2);
        pricePerKgRuble = (
          parseFloat(pricePerKgDollar) * currencyRuble
        ).toFixed(2);
      } else {
        pricePerKgDollar = (res?.pricePerKg || 0).toFixed(2);
        pricePerKgRuble = ((res?.pricePerKg || 0) * currencyRuble).toFixed(2);
      }

      const insuranceCostDollar = calculateInsuranceCost(
        res?.cost || 0,
        costInDollar
      ).toFixed(2);
      const totalCostFinal = calculateTotalCost(
        res?.cost || 0,
        packagingCost,
        parseFloat(insuranceCostDollar)
      );
      const totalCostFinalDollar = totalCostFinal.toFixed(2);
      const totalCostFinalRuble = (totalCostFinal * currencyRuble).toFixed(2);

      // Сохраняем данные в State
      State.setDirectionData(directionName, {
        currencyYuan: currencyYuan, // Передаем реальное значение yuan
        currencyRuble: currencyRuble,
        costInDollar: costInDollar,
        totalCostFinalDollar: parseFloat(totalCostFinalDollar),
        totalCostFinalRuble: parseFloat(totalCostFinalRuble),
        totalVolume: totalVolume,
        totalWeight: totalWeight,
        quantity: quantity,
        pricePerKgDollar: pricePerKgDollar,
        pricePerKgRuble: pricePerKgRuble,
        packingTypeValue: packingTypeValue,
        packagingCost: packagingCost, // в долларах
        insuranceCostDollar: parseFloat(insuranceCostDollar),
      });

      // Вывод в консоль (как было ранее)
      console.table({
        Направление: directionName,
        "Cтоимость товара": `${totalCost} ${
          selectedCurrency === "dollar"
            ? "$"
            : selectedCurrency === "ruble"
            ? "₽"
            : "¥"
        }`,
        "Выбранная валюта": selectedCurrency,
        "Стоимость товара в долларах": `${costInDollar.toFixed(2)} $`,
        Объем: totalVolume,
        Килограм: totalWeight,
        Количество: quantity,
        Плотность: density,
        "Категория груза": categoryKey,
        Тариф: calculationMode,
        "Стоимость за КГ": `${pricePerKgDollar} $ | ${pricePerKgRuble} ₽`,
        Бренд: brandIncluded ? "Да (Включено)" : "Нет",
        Упаковка: packingTypeValue,
        "Стоимость доставки": `${shippingCostDollar} $`,
        "Стоимость упаковки": `${packagingCost.toFixed(2)} $`,
        "Стоимость страховки": `${insuranceCostDollar} $`,
        "Общая стоимость": `${totalCostFinalDollar} $ | ${totalCostFinalRuble} ₽`,
      });

      // Дополнительное обновление HTML
      // Находим нужный блок по направлению: .price-auto, .price-train, .price-avia
      const priceBlock = document.querySelector(`.price-${directionName}`);
      if (priceBlock) {
        // Обновляем текст "Стоимость за КГ"
        const titleTarif = priceBlock.querySelector(
          ".calculate-result__title_tarif"
        );
        if (titleTarif) {
          titleTarif.textContent = "За КГ:";
        }

        // Обновляем стоимость за КГ в долларах
        const kgDollarEl = priceBlock.querySelector(".calculate-result__kg");
        if (kgDollarEl) {
          kgDollarEl.textContent = pricePerKgDollar;
        }

        // Обновляем стоимость за КГ в рублях
        const kgRubleEl = priceBlock.querySelector(
          ".calculate-result__kg_ruble"
        );
        if (kgRubleEl) {
          kgRubleEl.textContent = pricePerKgRuble;
        }

        // Обновляем общую стоимость в долларах
        const dollarEl = priceBlock.querySelector(".calculate-result__dollar");
        if (dollarEl) {
          dollarEl.textContent = totalCostFinalDollar;
        }

        // Обновляем общую стоимость в рублях
        const rubleEl = priceBlock.querySelector(".calculate-result__ruble");
        if (rubleEl) {
          rubleEl.textContent = totalCostFinalRuble;
        }
      }
    });

    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) resultBlock.classList.add("active");
  }
}

// main.js
import { CONFIG } from "./config.js";
import { TelegramGroupInfo } from "./api/TelegramGroupInfo.js";
import { CurrencyParser } from "./calculations/CurrencyParser.js";
import { JsonDataLoader } from "./data/JsonDataLoader.js";
import { CalculatorValidation } from "./calculations/CalculatorValidation.js";
import { DeliveryCalculator } from "./calculations/DeliveryCalculator.js";
import { UIController } from "./ui/UIController.js";
import { State } from "./data/State.js";

(async () => {
  const groupInfo = new TelegramGroupInfo(CONFIG.botToken, CONFIG.chatId);
  const groupName = await groupInfo.getGroupName();

  let currencyYuan;
  let currencyRuble;

  if (groupName) {
    const currencyParser = new CurrencyParser();
    try {
      currencyParser.parseAndCalculate(groupName);
      currencyYuan = currencyParser.getYuanRate();
      currencyRuble = currencyParser.getDollarRate();
      console.log(`1$ = ${currencyYuan} юань`);
      console.log(`1$ = ${currencyRuble} рубль`);

      document.querySelector(
        'input[name="current_rate_ruble"]'
      ).value = `${currencyRuble}`;
      document.querySelector(
        'input[name="current_rate_yuan"]'
      ).value = `${currencyYuan}`;
    } catch (error) {
      UIController.showError(
        "Не удалось получить курс валют: " + error.message
      );
    }
  } else {
    UIController.showError("Не удалось получить имя группы.");
  }

  const jsonLoader = new JsonDataLoader(CONFIG.jsonPath);
  await jsonLoader.load();

  const fields = {
    totalCost: document.querySelector('input[name="total_cost"]'),
    totalCurrency: document.querySelector('input[name="total_currecy"]'),
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
    UIController.showError("Курсы валют не загружены, расчет невозможен.");
    return;
  }

  fields.weightVolumeChange.addEventListener("change", () => {
    if (fields.weightVolumeChange.checked) {
      fields.totalVolume.disabled = false;
      fields.volumeLength.disabled = true;
      fields.volumeWidth.disabled = true;
      fields.volumeHeight.disabled = true;

      validation.clearErrors();
      validation.clearFields([
        fields.volumeLength,
        fields.volumeWidth,
        fields.volumeHeight,
      ]);
    } else {
      fields.totalVolume.disabled = true;
      fields.volumeLength.disabled = false;
      fields.volumeWidth.disabled = false;
      fields.volumeHeight.disabled = false;

      validation.clearErrors();
      validation.clearFields([fields.totalVolume]);
    }
  });

  document
    .querySelector(".js-calculate-result")
    .addEventListener("click", (e) => {
      e.preventDefault();
      UIController.clearError(); // Чистим старые ошибки
      if (validation.validateAll()) {
        calculator.calculate();
      } else {
        UIController.showError("Валидация не пройдена.");
      }
    });
})();

function prepareOfferData(
  directionKey,
  {
    currencyYuan,
    currencyRuble,
    costInDollar,
    totalCostFinalDollar,
    totalCostFinalRuble,
    totalVolume,
    totalWeight,
    quantity,
    pricePerKgDollar,
    pricePerKgRuble,
    packingTypeValue,
    packagingCost,
    insuranceCostDollar,
  }
) {
  const directionRusMap = {
    price_auto: "Авто",
    price_train: "ЖД",
    price_avia: "Авиа",
  };

  const directionRus = directionRusMap[directionKey];
  if (!directionRus) {
    console.error("Не найден рус. перевод для", directionKey);
    return null;
  }

  const goodsCostRuble = costInDollar * currencyRuble;
  const commissionPriceRub = goodsCostRuble * 0.05;
  const commissionPriceDollar = commissionPriceRub / currencyRuble;
  const packageCostRub = (packagingCost * currencyRuble).toFixed(2);
  const insuranceCostRub = (insuranceCostDollar * currencyRuble).toFixed(2);

  let offerDataCargoRequest = {
    DeliveryType: "Тип доставки: " + directionRus,
    ExchangeRateYuan: "Курс юаня SAIDE: " + currencyYuan + "₽",
    ExchangeRateDollar: "Курс доллара SAIDE: " + currencyRuble + "₽",
    TOTAL:
      "ИТОГО: " +
      totalCostFinalDollar.toFixed(2) +
      "$; " +
      totalCostFinalRuble.toFixed(2) +
      "₽",
    GoodsCost: "Стоимость товара: " + goodsCostRuble.toFixed(2) + "₽",
    Weight: "Вес: " + totalWeight + "кг",
    Volume: "Объем: " + totalVolume.toFixed(3) + "м³",
    Count: "Количество: " + quantity,
    RedeemCommissionFirst: "Комиссия SAIDE 5%",
    RedeemCommission:
      "от стоимости товара: " +
      commissionPriceDollar.toFixed(2) +
      "$; " +
      commissionPriceRub.toFixed(2) +
      "₽",
    PackageType: "Упаковка: " + packingTypeValue,
    PackageCost: "За упаковку: " + packageCostRub + "₽",
    Insurance:
      "Страховка: " +
      insuranceCostDollar.toFixed(2) +
      "$; " +
      insuranceCostRub +
      "₽",
    Kg: "За кг: " + pricePerKgDollar + "$; " + pricePerKgRuble + "₽",
    Sum:
      "Сумма: " +
      totalCostFinalDollar.toFixed(2) +
      "$; " +
      totalCostFinalRuble.toFixed(2) +
      "₽",
    // Если нужен TOTALTK или tkData, добавьте их здесь аналогично
  };

  return offerDataCargoRequest;
}

async function sendOfferData(offerDataCargoRequest) {
  // Отправка в формате application/x-www-form-urlencoded
  const params = new URLSearchParams();
  for (let key in offerDataCargoRequest) {
    params.append(key, offerDataCargoRequest[key]);
  }

  const response = await fetch(
    "https://api-calc.wisetao.com:4343/api/get-offer",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: params.toString(),
    }
  );

  if (!response.ok) {
    console.error("Ошибка сервера:", response.statusText);
    return;
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  // Открываем PDF в новой вкладке
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Если нужно скачать сразу:
  // const downloadLink = document.createElement("a");
  // downloadLink.href = url;
  // downloadLink.download = "Коммерческое предложение.pdf";
  // document.body.appendChild(downloadLink);
  // downloadLink.click();
  // document.body.removeChild(downloadLink);

  URL.revokeObjectURL(url);
}

document.querySelector(".js-get-pdf").addEventListener("click", () => {
  const checkedRadio = document.querySelector(
    'input[name="all-price"]:checked'
  );
  if (!checkedRadio) {
    console.error("Не выбрано направление для генерации PDF");
    return;
  }

  const directionKey = checkedRadio.value; // например: "price_auto"
  const direction = directionKey.replace("price_", ""); // "auto", "train", "avia"

  const directionData = State.getDirectionData(direction);
  if (!directionData) {
    console.error("Нет данных для выбранного направления:", direction);
    return;
  }

  const offerData = prepareOfferData(directionKey, directionData);
  if (!offerData) return;

  sendOfferData(offerData);
});
