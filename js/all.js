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
// project/src/data/State.js
export const State = {
  directionsData: {},

  tnvedSelection: {
    selectedItem: null,
    inputValue: "",
  },

  // Новое: храним курсы ЦБ (заглушка, или получим из другого запроса)
  cbrRates: {
    dollar: 78.95, // Пример, далее можно заменить на реальный
    yuan: 11.2, // Пример
  },

  setDirectionData(direction, data) {
    this.directionsData[direction] = data;
  },

  getDirectionData(direction) {
    return this.directionsData[direction] || null;
  },
};
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

  static showResults(results, data) {
    const {
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
      calcType,
      totalCostUserRub,
      dutyValue,
      dutyRub,
      ndsRub,
      declRub,
      shippingRub,
      totalCustomsRub,
      totalAllRub,
    } = data;

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

    // Находим tooltipTitle
    const tooltipTitle = document.querySelector(
      ".main-calc-result-tooltip__title"
    );
    // Находим блок .main-calc-result-tooltip__white
    const whiteBlock = document.querySelector(
      ".main-calc-result-tooltip__white"
    );

    if (calcType === "calc-cargo") {
      if (tooltipTitle) {
        tooltipTitle.textContent =
          "Только до терминала ТК “Южные ворота” Москва";
      }
      if (whiteBlock) {
        whiteBlock.classList.remove("active");
      }
    } else if (calcType === "calc-customs") {
      if (tooltipTitle) {
        tooltipTitle.textContent = "Доставка только до г.Благовещенск СВХ";
      }
      if (whiteBlock) {
        whiteBlock.classList.add("active");
      }

      // Пошлина
      const chosenImpEl = document.querySelector("._chosen-imp");
      if (chosenImpEl) {
        chosenImpEl.textContent = dutyValue + "%";
      }

      // НДС
      const ndsEl = document.querySelector("._nds");
      if (ndsEl) {
        ndsEl.textContent = "20%";
      }

      // Услуги декларации (550 юаней)
      // Нужно в $ и ₽
      // declRub = declRub
      const declDollarEl = document.querySelector("._decloration-dollar");
      const declRubleEl = document.querySelector("._decloration-ruble");
      if (declDollarEl && declRubleEl) {
        // Переводим declRub в доллары:
        const declDollar = declRub / State.cbrRates.dollar;
        declDollarEl.textContent = declDollar.toFixed(2) + "$";
        declRubleEl.textContent = declRub.toFixed(2) + "₽";
      }

      // Итого за всё (._all-white-dollar, ._all-white-ruble)
      const allWhiteDollarEl = document.querySelector("._all-white-dollar");
      const allWhiteRubleEl = document.querySelector("._all-white-ruble");
      if (allWhiteDollarEl && allWhiteRubleEl) {
        const totalAllDollar = totalAllRub / State.cbrRates.dollar;
        allWhiteDollarEl.textContent = totalAllDollar.toFixed(2) + "$";
        allWhiteRubleEl.textContent = totalAllRub.toFixed(2) + "₽";
      }
    }

    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) resultBlock.classList.add("active");
  }
}
import { State } from "../data/State.js";

export class CalculatorValidation {
  constructor(fields) {
    this.fields = fields; // Поля для валидации
    this.errors = {}; // Список ошибок
    this.setupInputRestrictions(); // Ограничение ввода
    // Добавляем вызов реалтайм-валидации:
    this.setupRealtimeValidation();
  }

  // Ограничение ввода
  setupInputRestrictions() {
    const setupFieldRestriction = (field, regex, maxDecimals = null) => {
      field.addEventListener("input", () => {
        // 1) Убираем все лишние символы, кроме цифр, точки, запятой
        field.value = field.value.replace(regex, "");

        // 2) Заменяем все запятые на точки
        field.value = field.value.replace(/,/g, ".");

        // 3) Ограничиваем количество точек до 1 (опционально)
        const partsDot = field.value.split(".");
        if (partsDot.length > 2) {
          // Удаляем «лишние» точки
          field.value = partsDot[0] + "." + partsDot.slice(1).join("");
        }

        // 4) Ограничиваем число знаков после точки, если maxDecimals != null
        if (maxDecimals !== null && partsDot[1]?.length > maxDecimals) {
          field.value = `${partsDot[0]}.${partsDot[1].substring(
            0,
            maxDecimals
          )}`;
        }
      });
    };

    setupFieldRestriction(this.fields.totalVolume, /[^0-9.,]/g, 4);
    setupFieldRestriction(this.fields.totalWeight, /[^0-9.,]/g, 2);
    setupFieldRestriction(this.fields.totalCost, /[^0-9.,]/g, 2);
    setupFieldRestriction(this.fields.quantity, /[^0-9]/g);
  }

  /**
   * Регистрируем слушатели 'input' (или 'change') на полях,
   * чтобы при изменении заново проверять конкретное поле
   */
  setupRealtimeValidation() {
    // Например, хотим отслеживать поля: totalVolume, totalWeight, totalCost, quantity,
    // и т.д., включая tnved_input
    const fieldNamesToWatch = [
      "totalVolume",
      "totalWeight",
      "totalCost",
      "quantity",
      "tnvedInput", // наше поле
      // ... при необходимости другие
    ];

    fieldNamesToWatch.forEach((fieldName) => {
      const fieldEl = this.fields[fieldName];
      if (fieldEl) {
        fieldEl.addEventListener("input", () => {
          // При вводе очищаем ошибку у этого поля (если была),
          // и проверяем заново
          this.removeError(fieldEl);
          this.validateSingleField(fieldName);
        });
      }
    });

    // Аналогично для radio-кнопок, например, brand, category
    // Можно по 'change'
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        this.clearCategoryError();
        this.validateCategory();
      });
    });

    // Или если хотите при клике на radio:
    // let packingType = document.querySelectorAll('input[name="packing-type"]');
    // ...
  }

  validateSingleField(fieldName) {
    // Вызовем ту же логику, что в validateAll(),
    // но только для одного поля.
    // Можно выделить разные методы: validateNumber, validateTnvedInput и т.д.
    switch (fieldName) {
      case "totalVolume":
        if (this.fields.weightVolumeChange.checked) {
          // Если включен режим "ввести объём напрямую", то totalVolume обязательное
          this.validateNumber("totalVolume", {
            required: true,
            maxDecimals: 4,
          });
        } else {
          // иначе используем validateDimensions()
          this.validateDimensions();
        }
        break;
      case "totalWeight":
        this.validateNumber("totalWeight", {
          required: true,
          min: 5,
          maxDecimals: 2,
        });
        break;
      case "totalCost":
        this.validateNumber("totalCost", {
          required: true,
          maxDecimals: 2,
        });
        break;
      case "quantity":
        this.validateNumber("quantity", { required: true });
        break;
      case "tnvedInput":
        // если calc-customs, тогда validateTnvedInput
        const calcTypeRadio = document.querySelector(
          'input[name="calc-type"]:checked'
        );
        const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";
        if (calcType === "calc-customs") {
          this.validateTnvedInput();
        }
        break;
      default:
        // Другие поля
        break;
    }
  }

  validateTnvedInput() {
    const field = this.fields.tnvedInput;
    // Если пользователь выбрал `calc-customs`, то
    // нужно проверять: selectedItem != null
    const selectedItem = State.tnvedSelection.selectedItem;

    if (!selectedItem) {
      this.addError(field, "Нужно выбрать ТНВЭД из списка");
      return false;
    }
    return true;
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
        this.addError(field, "Поля обязательны для заполнения");
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

  clearCategoryError() {
    // убираем текст и класс active из .js-error-category
    const errorSpan = document.querySelector(".error-message-category");
    const errorBlock = document.querySelector(".js-error-category");
    if (errorSpan) errorSpan.textContent = "";
    if (errorBlock) errorBlock.classList.remove("active");
  }

  removeError(fieldEl) {
    fieldEl.classList.remove("error-input");
    const parent = fieldEl.closest(".form-group") || fieldEl.parentElement;
    const errorSpan = parent.querySelector(".error-message");
    if (errorSpan) errorSpan.textContent = "";
  }

  clearErrors() {
    this.errors = {};
    document
      .querySelectorAll(".error-input")
      .forEach((el) => el.classList.remove("error-input"));
    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
    });

    this.clearCategoryError();
  }

  hideCalculationResult() {
    // 1) Скрываем блок с результатом
    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) {
      resultBlock.classList.remove("active");
    }
    // 2) Очищаем State, если нужно
    State.directionsData = {};
  }

  validateAll() {
    this.clearErrors();

    const calcTypeRadio = document.querySelector(
      'input[name="calc-type"]:checked'
    );
    const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";

    const { weightVolumeChange } = this.fields;

    // Базовые проверки
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
      calcType === "calc-cargo" ? this.validateCategory() : true,
      this.validateRadio("packing-type"),
      // Новая проверка для calc-customs:
      calcType === "calc-customs" ? this.validateTnvedInput() : true,
    ].every((result) => result);

    return isValid;
  }
}
import { State } from "../data/State.js";
import { CONFIG } from "../config.js";
import { UIController } from "../ui/ui-controller.js";

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
    return totalCost.toFixed(2); // если выбрали "dollar"
  }

  calculateDensity(totalWeight, totalVolume) {
    if (totalVolume > 0) {
      return (totalWeight / totalVolume).toFixed(2);
    }
    UIController.showError("Объем должен быть больше нуля");
    return null;
  }

  /**
   * Рассчёт для "calc-cargo" (старый)
   * @param {string} categoryKey
   * @param {number} density
   * @param {number} totalWeight
   * @param {number} totalVolume
   * @returns {Array} массив результатов для auto/train/avia
   */
  calculateCargo(categoryKey, density, totalWeight, totalVolume) {
    const directions = ["auto", "train", "avia"];
    return directions.map((direction) => {
      return this.calculateShippingCostForDirection(
        direction,
        categoryKey,
        density,
        totalWeight,
        totalVolume
      );
    });
  }

  /**
   * Рассчёт для "calc-customs"
   * @param {number} totalWeight
   * @returns {Array} массив с 3-мя направлениями, но одинаковым тарифом
   */
  calculateCustoms(totalWeight) {
    // ставка 0.6$/кг
    const directions = ["auto", "train", "avia"];
    return directions.map((direction) => {
      const shippingCost = totalWeight * 0.6; // по весу
      return {
        cost: shippingCost,
        pricePerKg: 0.6, // нет разницы в плотности
        calculationMode: "weight",
      };
    });
  }

  calculateShippingCostForDirection(
    direction,
    categoryKey,
    density,
    weight,
    volume
  ) {
    // Старый код выбора тарифов из JSON
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
      // "brand" добавляет 0.5$ или 50$ в зависимости от weight/volume
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
      // 1) Определить, какой режим выбран:
      const calcTypeRadio = document.querySelector(
        'input[name="calc-type"]:checked'
      );
      const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";

      // 2) Собираем общие данные
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

      // 3) Если calc-cargo — используем старый расчёт
      //    Если calc-customs — упрощённый
      let results;
      let density = 0;
      let categoryKey = "";

      if (calcType === "calc-cargo") {
        // Взять categoryKey, brand
        const categoryKeyElement = Array.from(this.fields.category).find(
          (field) => field.checked
        );
        if (!categoryKeyElement) {
          UIController.showError("Категория не выбрана!");
          return;
        }
        categoryKey = categoryKeyElement.value;

        density = this.calculateDensity(totalWeight, totalVolume);
        if (!density) {
          return; // Ошибка уже показана
        }

        results = this.calculateCargo(
          categoryKey,
          density,
          totalWeight,
          totalVolume
        );
      } else {
        // calc-customs
        results = this.calculateCustoms(totalWeight);

        // --- НОВЫЙ КОД Начало ---
        let totalCostUserRub = totalCost;
        if (selectedCurrency === "dollar") {
          totalCostUserRub = totalCost * State.cbrRates.dollar;
        } else if (selectedCurrency === "yuan") {
          totalCostUserRub = totalCost * State.cbrRates.yuan;
        }

        const dutyValue = State.tnvedSelection.chosenCodeImp || 10;
        const dutyRub = (dutyValue / 100) * totalCostUserRub;

        const sumWithDuty = totalCostUserRub + dutyRub;
        const ndsRub = sumWithDuty * 0.2;

        const declRub = 550 * State.cbrRates.yuan;

        const totalCustomsRub =
          sumWithDuty + ndsRub + declRub - totalCostUserRub;

        const shippingDollar = results[0].cost;
        const shippingRub = shippingDollar * State.cbrRates.dollar;
        const totalAllRub = totalCustomsRub + shippingRub;
        // --- НОВЫЙ КОД Конец ---
      }

      // 4) Packaging
      const packingType = document.querySelector(
        'input[name="packing-type"]:checked'
      )?.value;
      if (!packingType) {
        UIController.showError("Упаковка не выбрана!");
        return;
      }

      const packagingCost = this.calculatePackagingCost(
        packingType,
        totalVolume,
        parseInt(this.fields.quantity.value, 10)
      );

      let totalCostUserRub = 0;

      if (calcType === "calc-cargo") {
        // 5) Передаём результаты в UIController
        UIController.showResults(results, {
          calcType: "calc-cargo",
          totalCost,
          selectedCurrency,
          costInDollar,
          totalVolume,
          totalWeight,
          quantity: parseInt(this.fields.quantity.value, 10),
          density, // при calc-customs может быть 0
          categoryKey,
          packagingCost,
          currencyYuan: this.currencyYuan,
          currencyRuble: this.currencyRuble,
          brandIncluded:
            this.fields.brand?.checked && calcType === "calc-cargo",
          packingTypeValue: packingType,
          calculateInsuranceCost: this.calculateInsuranceCost.bind(this),
          calculateTotalCost: this.calculateTotalCost.bind(this),
        });
      } else {
        // 5) Передаём результаты в UIController
        UIController.showResults(results, {
          calcType: "calc-customs",
          totalCost,
          selectedCurrency,
          costInDollar,
          totalVolume,
          totalWeight,
          quantity: parseInt(this.fields.quantity.value, 10),
          density, // при calc-customs может быть 0
          categoryKey,
          packagingCost,
          currencyYuan: this.currencyYuan,
          currencyRuble: this.currencyRuble,
          brandIncluded:
            this.fields.brand?.checked && calcType === "calc-cargo",
          packingTypeValue: packingType,

          // Все данные для UI

          totalCostUserRub,
          dutyValue,
          dutyRub,
          ndsRub,
          declRub,
          shippingRub,
          totalCustomsRub,
          totalAllRub,

          calculateInsuranceCost: this.calculateInsuranceCost.bind(this),
          calculateTotalCost: this.calculateTotalCost.bind(this),
        });
      }
    } catch (error) {
      UIController.showError(
        "Произошла непредвиденная ошибка при расчёте: " + error.message
      );
      console.error(error);
    }
  }
}
// main.js
import { CONFIG } from "./config.js";
import { TelegramGroupInfo } from "./api/TelegramGroupInfo.js";
import { CurrencyParser } from "./calculations/CurrencyParser.js";
import { JsonDataLoader } from "./data/JsonDataLoader.js";
import { CalculatorValidation } from "./calculations/CalculatorValidation.js";
import { DeliveryCalculator } from "./calculations/DeliveryCalculator.js";
import { UIController } from "./ui/ui-controller.js";
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
    tnvedInput: document.querySelector('input[name="tnved_input"]'),
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
        // Скроллим до блока .main-calc-result
        const resultBlock = document.querySelector(".main-calc-result");
        if (resultBlock) {
          resultBlock.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        UIController.showError("Валидация не пройдена.");
        // Скроллим до блока .main-calc-result
        const wrapperBlock = document.querySelector(".main-calc__wrapper");
        if (wrapperBlock) {
          wrapperBlock.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });

  // Предположим, что validation и State уже созданы
  // Собираем все поля, которые при изменении должны сбрасывать результат
  const allFieldsToReset = [
    fields.totalCost,
    fields.totalWeight,
    fields.totalVolume,
    fields.totalVolumeCalculated,
    fields.volumeLength,
    fields.volumeWidth,
    fields.volumeHeight,
    fields.quantity,
    fields.tnvedInput,
    fields.brand,
    fields.insurance,
    // и т. д. ...
  ];

  // Вешаем 'input' на обычные поля, 'change' на radio/checkbox
  allFieldsToReset.forEach((fld) => {
    if (!fld) return; // вдруг чего-то нет
    // Определим подходящее событие
    const eventName =
      fld.type === "radio" || fld.type === "checkbox" ? "change" : "input";
    fld.addEventListener(eventName, () => {
      validation.hideCalculationResult();
    });
  });

  // И ещё для переключателя calc-type
  const calcTypeRadios = document.querySelectorAll('input[name="calc-type"]');
  calcTypeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      validation.hideCalculationResult();
      // Плюс если нужно очистить поля:
      validation.clearErrors();
      const allFields = Object.values(fields);
      validation.clearFields(allFields);
    });
  });
})();
import { State } from "../data/State.js";

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

  // Карта для отображения понятных названий упаковки:
  const packingTypeMap = {
    std_pack: "Стандартная упаковка",
    pack_corner: "Упаковка с углами",
    wood_crate: "Деревянная обрешетка",
    tri_frame: "Треугольная деревянная рама",
    wood_pallet: "Деревянный поддон",
    pallet_water: "Поддон с водонепроницаемой упаковкой",
    wood_boxes: "Деревянные коробки",
  };

  const directionRus = directionRusMap[directionKey];
  if (!directionRus) {
    console.error("Не найден рус. перевод для", directionKey);
    return null;
  }

  const packingTypeDisplay =
    packingTypeMap[packingTypeValue] || "Неизвестная упаковка";
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
      "Стоимость до г. Москва (ТК «Южные ворота»): " +
      totalCostFinalDollar.toFixed(2) +
      "$; " +
      totalCostFinalRuble.toFixed(2) +
      "₽",
    GoodsCost: "Стоимость товара: " + goodsCostRuble.toFixed(2) + "₽",
    Weight: "Вес: " + totalWeight + "кг",
    Volume: "Объем: " + totalVolume.toFixed(3) + "м³",
    Count: "Количество мест: " + quantity,
    RedeemCommissionFirst: "",
    /* RedeemCommissionFirst: "Комиссия SAIDE 5%", */
    RedeemCommission: "",
    /* RedeemCommission:
      "от стоимости товара: " +
      commissionPriceDollar.toFixed(2) +
      "$; " +
      commissionPriceRub.toFixed(2) +
      "₽", */
    PackageType: "Упаковка: " + packingTypeDisplay,
    PackageCost: "За упаковку: " + packageCostRub + "₽",
    Insurance:
      "Страховка: " +
      insuranceCostDollar.toFixed(2) +
      "$; " +
      insuranceCostRub +
      "₽",
    Kg: "За кг: " + pricePerKgDollar + "$; " + pricePerKgRuble + "₽",
    Sum:
      "Стоимость до г. Москва: " +
      totalCostFinalDollar.toFixed(2) +
      "$; " +
      totalCostFinalRuble.toFixed(2) +
      "₽",
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
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "Коммерческое предложение.pdf";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  URL.revokeObjectURL(url);
}

// Ссылки на элементы
const overlayCalc = document.querySelector(".main-calc__over");
const overlayMessageCalc = overlayCalc.querySelector(
  ".main-calc__over_pdf span:first-child"
);
const overlayCountdownCalc = overlayCalc.querySelector(
  ".main-calc__over_pdf_count"
);

let countdownTimer = null;

// Функция для запуска обратного отсчёта
function startCountdown(seconds = 10) {
  overlayCountdownCalc.textContent = seconds;
  countdownTimer = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      // Когда время истекло, но ответа нет, можно оставить так
      // либо добавить какой-то обработчик
    } else {
      overlayCountdownCalc.textContent = seconds;
    }
  }, 1000);
}

// Функция для остановки и сброса обратного отсчёта
function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

// Обработчик при нажатии на оверлей для его скрытия после успеха
overlayCalc.addEventListener("click", (event) => {
  // Проверим, есть ли в тексте слово "Успешно" - чтобы не закрыть до ответа.
  if (overlayMessageCalc.textContent.includes("Успешно получено")) {
    overlayCalc.classList.remove("active");
  }
});

document.querySelector(".js-get-pdf").addEventListener("click", async () => {
  const checkedRadio = document.querySelector(
    'input[name="all-price"]:checked'
  );
  if (!checkedRadio) {
    console.error("Не выбрано направление для генерации PDF");
    return;
  }

  const directionKey = checkedRadio.value;
  const direction = directionKey.replace("price_", "");

  const directionData = State.getDirectionData(direction);
  if (!directionData) {
    console.error("Нет данных для выбранного направления:", direction);
    return;
  }

  const offerData = prepareOfferData(directionKey, directionData);
  if (!offerData) return;

  // Показать оверлей и запустить обратный отсчет
  overlayCalc.classList.add("active");
  overlayMessageCalc.innerHTML = `Идёт передача данных менеджеру <br> пожалуйста, подождите...`;
  startCountdown(20);

  // Отправить запрос
  try {
    await sendOfferData(offerData);
    // Если успешно - обновляем текст
    stopCountdown();
    overlayMessageCalc.textContent =
      "Успешно получено. Нажмите на экран чтобы закрыть окно";
    // Счётчик уберём, можно очистить текст или оставить в предыдущем состоянии
    overlayCountdownCalc.textContent = "";
  } catch (error) {
    console.error("Ошибка при получении PDF:", error);
    stopCountdown();
    overlayMessageCalc.textContent = "Произошла ошибка при получении PDF";
    overlayCountdownCalc.textContent = "";
  }
});
import { State } from "../data/State.js";

// Карта для отображения понятных названий упаковки:
const packingTypeMap = {
  std_pack: "Стандартная упаковка",
  pack_corner: "Упаковка с углами",
  wood_crate: "Деревянная обрешетка",
  tri_frame: "Треугольная деревянная рама",
  wood_pallet: "Деревянный поддон",
  pallet_water: "Поддон с водонепроницаемой упаковкой",
  wood_boxes: "Деревянные коробки",
};

// Функция для обновления данных в tooltip, принимаем сам элемент tooltip
function updateTooltipData(directionKey, tooltip) {
  const direction = directionKey.replace("price_", "");
  const directionData = State.getDirectionData(direction);
  if (!directionData) {
    console.error("Нет данных для выбранного направления:", direction);
    return;
  }

  const {
    currencyYuan,
    currencyRuble,
    totalCostFinalDollar,
    totalCostFinalRuble,
    packagingCost,
    insuranceCostDollar,
    pricePerKgDollar,
    pricePerKgRuble,
    packingTypeValue,
  } = directionData;

  const packDollar = packagingCost.toFixed(2);
  const packRuble = (packagingCost * currencyRuble).toFixed(2);
  const insuranceRub = (insuranceCostDollar * currencyRuble).toFixed(2);
  const packingName =
    packingTypeMap[packingTypeValue] || "Неизвестная упаковка";

  // Заполняем поля тултипа
  tooltip.querySelector("._ruble").textContent = currencyRuble + " ₽";
  tooltip.querySelector("._yuan").textContent = currencyYuan + " ₽";
  tooltip.querySelector("._packing").textContent = packingName;

  tooltip.querySelector("._pack-dollar").textContent = packDollar + " $";
  tooltip.querySelector("._pack-ruble").textContent = packRuble + " ₽";

  tooltip.querySelector("._insurance-dollar").textContent =
    insuranceCostDollar.toFixed(2) + " $";
  tooltip.querySelector("._insurance-ruble").textContent = insuranceRub + " ₽";

  tooltip.querySelector("._kg-dollar").textContent = pricePerKgDollar + " $";
  tooltip.querySelector("._kg-ruble").textContent = pricePerKgRuble + " ₽";

  tooltip.querySelector("._all-dollar").textContent =
    totalCostFinalDollar.toFixed(2) + " $";
  tooltip.querySelector("._all-ruble").textContent =
    totalCostFinalRuble.toFixed(2) + " ₽";
}

// Теперь находим все price-label и для каждого навешиваем обработчики
const priceLabels = document.querySelectorAll(".main-calc-result__price");
priceLabels.forEach((label) => {
  // Ищем .overflow-info рядом (на том же уровне вложенности в .price-cell)
  const priceCell = label.closest(".price-cell");
  const overflowInfo = priceCell.querySelector(".overflow-info");
  if (!overflowInfo) return;

  const tooltip = overflowInfo.querySelector(".main-calc-result-tooltip");

  label.addEventListener("mouseenter", () => {
    // Определяем направление
    const priceBlock = label.querySelector(
      ".price-auto, .price-train, .price-avia"
    );
    if (!priceBlock) return;

    let directionKey = "";
    if (priceBlock.classList.contains("price-auto"))
      directionKey = "price_auto";
    if (priceBlock.classList.contains("price-train"))
      directionKey = "price_train";
    if (priceBlock.classList.contains("price-avia"))
      directionKey = "price_avia";

    // Обновить данные tooltip для конкретного overflowInfo
    updateTooltipData(directionKey, tooltip);

    // Показать tooltip
    overflowInfo.classList.add("active");
  });

  label.addEventListener("mouseleave", () => {
    // Когда увели мышь с label, скрываем tooltip
    overflowInfo.classList.remove("active");
  });

  // Если хотим, чтобы при наведении на tooltip он оставался видимым,
  // то можно убрать удаление класса здесь и контролировать отдельно.
  overflowInfo.addEventListener("mouseleave", () => {
    overflowInfo.classList.remove("active");
  });
});

// Дополнительный функционал для кнопки "ПОЛУЧИТЬ РАСЧЕТ В PDF" внутри tooltip, если нужно
document.querySelectorAll(".main-calc-result-tooltip__btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Действие по клику на получение PDF (уже реализовано выше)
    const checkedRadio = document.querySelector(
      'input[name="all-price"]:checked'
    );
    if (!checkedRadio) {
      console.error("Не выбрано направление для генерации PDF");
      return;
    }

    const directionKey = checkedRadio.value;
    const direction = directionKey.replace("price_", "");
    const directionData = State.getDirectionData(direction);
    if (!directionData) {
      console.error("Нет данных для выбранного направления:", direction);
      return;
    }

    const offerData = prepareOfferData(directionKey, directionData);
    if (!offerData) return;

    sendOfferData(offerData);
  });
});
import { State } from "../data/State.js";

class SuggestionsService {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  async fetchSuggestions(query) {
    const url = `${
      this.apiBase
    }/get-matching-names?good_name=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ошибка загрузки подсказок");
    return await response.json();
  }
}

class SuggestionsUI {
  constructor({
    inputField, // tnved-input
    suggestionContainer, // блок с выпадающим списком
    nameInput, // tnved-name-input
    codeInput, // tnved-code-input
    nameCodeContainer, // сам блок .name-code-container
  }) {
    this.inputField = inputField;
    this.suggestionContainer = suggestionContainer;
    this.nameInput = nameInput;
    this.codeInput = codeInput;
    this.nameCodeContainer = nameCodeContainer;

    this.debounceTimer = null;
    this.DEBOUNCE_DELAY = 2000;
    this.suggestionsService = null; // будет установлено извне
    this.onItemSelect = null; // колбэк при выборе элемента (если нужно)
    this.onTreeOpen = null; // колбэк при открытии дерева (клик по стрелке)
  }

  init() {
    this.inputField.addEventListener("input", () => this.handleInput());
  }

  handleInput() {
    const query = this.inputField.value.trim();

    // 1) Запоминаем введённое в State
    State.tnvedSelection.inputValue = this.inputField.value;
    // 2) Сбрасываем выбранный элемент
    State.tnvedSelection.selectedItem = null;

    // Если пользователь начинает печатать заново,
    // убираем .active у блока name-code-container
    if (this.nameCodeContainer.classList.contains("active")) {
      this.nameCodeContainer.classList.remove("active");
      // Очистим поля
      this.nameInput.textContent = "";
      this.codeInput.textContent = "";
    }

    if (query.length < 3) {
      this.hideSuggestions();
      return;
    }
    // Запускаем анимацию загрузки
    this.startLoadingAnimation();

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      await this.loadSuggestions(query);
    }, this.DEBOUNCE_DELAY);
  }

  async loadSuggestions(query) {
    try {
      const data = await this.suggestionsService.fetchSuggestions(query);
      this.stopLoadingAnimation();
      this.renderSuggestions(data);
    } catch (e) {
      console.error(e);
      this.stopLoadingAnimation();
      this.renderNoSuggestions();
    }
  }

  renderNoSuggestions() {
    this.suggestionContainer.innerHTML = "";
    const noItem = document.createElement("div");
    noItem.className = "suggestion-item";
    noItem.innerText = "Ничего не найдено";
    this.suggestionContainer.appendChild(noItem);
    this.showSuggestions();
  }

  renderSuggestions(data) {
    this.suggestionContainer.innerHTML = "";
    if (!Array.isArray(data) || data.length === 0) {
      this.renderNoSuggestions();
      return;
    }

    data.forEach((item, index) => {
      const suggestionItem = document.createElement("div");
      suggestionItem.className = "suggestion-item";

      // Имя и код
      const nameEl = document.createElement("div");
      nameEl.textContent = item.KR_NAIM;
      nameEl.style.fontWeight = "bold";

      const codeEl = document.createElement("div");
      codeEl.textContent = `Код: ${item.CODE}`;

      // Клик по suggestionItem = выбор
      suggestionItem.addEventListener("click", () => {
        // 1) Сохраняем выбранный элемент в State (либо где вам удобно)
        State.tnvedSelection.selectedItem = item;
        // А также обновим inputValue, если нужно
        State.tnvedSelection.inputValue = item.CODE;

        // 2) Заполняем поля визуально
        this.nameInput.textContent = item.KR_NAIM;
        this.codeInput.textContent = item.CODE;
        this.nameCodeContainer.classList.add("active");
        this.inputField.value = item.CODE; // обновим поле

        // 3) Делает второй запрос, передавая item.CODE
        this.fetchDataForChosenCode(item.CODE);

        // Если нужно убрать ошибку:
        const field = document.querySelector('input[name="tnved_input"]');
        if (field) {
          field.classList.remove("error-input");
          const parent = field.closest(".form-group") || field.parentElement;
          const errorSpan = parent.querySelector(".error-message");
          if (errorSpan) {
            errorSpan.textContent = "";
          }
        }

        console.table(item);

        if (typeof this.onItemSelect === "function") {
          this.onItemSelect(item);
        }

        this.hideSuggestions();
      });

      // Стрелка/ссылка (справа), открывающая дерево
      const arrowEl = document.createElement("span");
      arrowEl.className = "open-tree-arrow";
      arrowEl.textContent = "➔";
      // Остановим всплытие, чтобы клик именно по стрелке не выбирал подсказку
      arrowEl.addEventListener("click", (e) => {
        e.stopPropagation();
        // Вызываем колбэк открытия дерева
        if (typeof this.onTreeOpen === "function") {
          this.onTreeOpen(item);
        }
      });

      suggestionItem.appendChild(nameEl);
      suggestionItem.appendChild(codeEl);
      suggestionItem.appendChild(arrowEl);

      this.suggestionContainer.appendChild(suggestionItem);

      if (index < data.length - 1) {
        const divider = document.createElement("div");
        divider.className = "suggestion-divider";
        this.suggestionContainer.appendChild(divider);
      }
    });
    this.showSuggestions();
  }

  showSuggestions() {
    this.suggestionContainer.style.display = "block";
  }

  hideSuggestions() {
    this.suggestionContainer.style.display = "none";
  }

  // Запустить анимацию загрузки на поле ввода
  startLoadingAnimation() {
    this.inputField.classList.add("loading");
  }

  // Остановить анимацию загрузки
  stopLoadingAnimation() {
    this.inputField.classList.remove("loading");
  }

  async fetchDataForChosenCode(code) {
    // Получаем ссылку на .tnved-code-percent
    const tnvedPercentEl = document.querySelector(".tnved-code-percent");
    if (!tnvedPercentEl) {
      console.warn("Не найден .tnved-code-percent на странице");
      return;
    }

    // Перед запросом показываем текст об ожидании
    tnvedPercentEl.textContent = "Ищем процент, подождите...";

    try {
      const response = await fetch(
        "https://api-calc.wisetao.com:4343/api/parse-alta-duty",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ code: code }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при получении данных");
      }

      const data = await response.json(); // data может быть объектом или false
      console.log("Доп. данные по коду:", data);

      let percentValue = 10; // По умолчанию 10 (если не получили код)
      let infoText = ""; // Переменная для хранения информации

      if (data && typeof data.duty !== "undefined") {
        // Преобразуем data.duty в число
        const dutyValue = Number(data.duty); // или parseFloat(data.duty)

        if (!isNaN(dutyValue)) {
          // Если dutyValue является числом
          percentValue = dutyValue;
          tnvedPercentEl.textContent = `${percentValue} %`;
        } else {
          // Если dutyValue не число
          tnvedPercentEl.textContent =
            "Нет информации по % пошлине, для наглядности будет использоваться 10%";
        }

        // Проверяем наличие поля info
        if (data.info && data.info.trim() !== "") {
          infoText = ` (${data.info})`; // Добавляем информацию, если она есть
        }
      } else {
        // Нет данных
        tnvedPercentEl.textContent =
          "Нет информации по % пошлине, для наглядности будет использоваться 10%";
      }

      // Обновляем текст с учетом информации
      tnvedPercentEl.textContent += infoText;

      // Сохраняем в State
      State.tnvedSelection.chosenCodeImp = percentValue;
    } catch (error) {
      console.error("Произошла ошибка:", error);
      tnvedPercentEl.textContent =
        "Нет информации по % пошлине (ошибка запроса), используется 10%";
      State.tnvedSelection.chosenCodeImp = 10;
    }
  }
}

class TnvedTreeService {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  async loadRoot() {
    const url = `${this.apiBase}/get-tree-elems?parentNode=`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ошибка загрузки дерева");
    const textData = await response.text();
    return this.parseTreeItems(textData);
  }

  async loadChildren(parentId) {
    const url = `${this.apiBase}/get-tree-elems?parentNode=${encodeURIComponent(
      parentId
    )}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ошибка загрузки поддерева");
    const textData = await response.text();
    return this.parseTreeItems(textData);
  }

  parseTreeItems(htmlString) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    const items = tempDiv.querySelectorAll("li[data-id]");
    const result = [];
    items.forEach((li) => {
      const dataId = li.getAttribute("data-id");
      const text = li.textContent.trim();
      const codeEl = li.querySelector(".tnved-tree__node-code");
      const code = codeEl ? codeEl.textContent.trim() : null;
      result.push({ dataId, text, code });
    });
    return result;
  }
}

class TnvedTreeUI {
  constructor({ treeContainer, overlay, closeButton, treeList }) {
    this.treeContainer = treeContainer;
    this.overlay = overlay;
    this.closeButton = closeButton;
    this.treeList = treeList;
    this.treeService = null; // будет установлен извне
    this.isOpen = false;
  }

  init() {
    this.closeButton.addEventListener("click", () => this.close());
    this.overlay.addEventListener("click", () => this.close());
    this.treeList.addEventListener("click", (e) => this.handleToggle(e));
  }

  async open() {
    if (!this.isOpen) {
      // Загружаем корневые элементы
      const items = await this.treeService.loadRoot();
      this.renderItems(this.treeList, items);
      this.treeContainer.style.display = "block";
      this.overlay.style.display = "block";
      this.isOpen = true;
    }
  }

  close() {
    this.treeContainer.style.display = "none";
    this.overlay.style.display = "none";
    this.treeList.innerHTML = "";
    this.isOpen = false;
  }

  async handleToggle(e) {
    if (!e.target.classList.contains("tnved-toggle-icon")) return;
    const parentItem = e.target.closest(".tnved-tree-item");
    if (!parentItem) return;

    const subTree = parentItem.querySelector(".tnved-sub-tree");
    if (subTree) {
      // Если поддерево уже загружено
      subTree.classList.toggle("open");
      e.target.classList.toggle("expanded");
      this.correctLineHeights(subTree);
    } else {
      // Догружаем поддерево
      const dataId = parentItem.getAttribute("data-id");
      const children = await this.treeService.loadChildren(dataId);
      if (children.length > 0) {
        const newSubTree = document.createElement("ul");
        newSubTree.className = "tnved-sub-tree";
        parentItem.appendChild(newSubTree);
        this.renderItems(newSubTree, children);
        newSubTree.classList.add("open");
        e.target.classList.add("expanded");
        this.correctLineHeights(newSubTree);
      }
    }
  }

  renderItems(container, items) {
    container.innerHTML = "";
    items.forEach((it) => {
      const li = document.createElement("li");
      li.className = "tnved-tree-item";
      li.setAttribute("data-id", it.dataId);

      const line = document.createElement("div");
      line.className = "tnved-tree-item-line";

      const toggleIcon = document.createElement("div");
      toggleIcon.className = "tnved-toggle-icon";

      // Если есть код, отображаем его как кликабельный
      if (it.code && it.code.length > 0) {
        const codeSpan = document.createElement("span");
        codeSpan.className = "tnved-code";
        codeSpan.textContent = it.code;
        codeSpan.addEventListener("click", () => {
          console.table(it);
          // Дополнительная логика при выборе кода (если нужно)
          this.close();
        });
        li.appendChild(line);
        li.appendChild(toggleIcon);
        li.appendChild(codeSpan);
      } else {
        li.appendChild(line);
        li.appendChild(toggleIcon);
      }

      const textSpan = document.createElement("span");
      textSpan.className = "tnved-item-text";
      textSpan.textContent = it.text;
      li.appendChild(textSpan);

      container.appendChild(li);
    });
    // Добавляем пустой элемент для визуального оформления линии
    const emptyLi = document.createElement("li");
    emptyLi.className = "tnved-tree-item";
    emptyLi.style.height = "0";
    container.appendChild(emptyLi);

    this.correctLineHeights(container);
  }

  correctLineHeights(container) {
    const items = container.querySelectorAll(".tnved-tree-item");
    const arr = Array.from(items);
    arr.forEach((item, index) => {
      if (index < arr.length - 1) {
        const next = arr[index + 1];
        const line = item.querySelector(".tnved-tree-item-line");
        if (!line) return;
        const currentHeight = item.clientHeight;
        const nextHeight = next.clientHeight;
        const lineHeight = (currentHeight + nextHeight) / 2 + 10;
        line.style.height = lineHeight + "px";
        line.style.top = currentHeight / 2 + "px";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const apiBase = "https://api-calc.wisetao.com:4343/api";

  const nameInput = document.querySelector(".tnved-name-input");
  const codeInput = document.querySelector(".tnved-code-input");
  const tnvedInput = document.querySelector(".tnved-input");
  const suggestionContainer = document.querySelector(".suggestion");
  const nameCodeContainer = document.querySelector(".name-code-container");

  // Дерево
  const treeContainer = document.querySelector(".tnved-tree-container");
  const overlay = document.querySelector(".overlay");
  const closeButton = document.querySelector(".tnved-tree-close-button");
  const treeList = document.querySelector(".tnved-tree-list");

  // Инициализация сервисов
  const suggestionsService = new SuggestionsService(apiBase);
  const tnvedTreeService = new TnvedTreeService(apiBase);

  // Инициализация UI
  const suggestionsUI = new SuggestionsUI({
    inputField: tnvedInput,
    suggestionContainer: suggestionContainer,
    nameInput: nameInput,
    codeInput: codeInput,
    nameCodeContainer: nameCodeContainer,
  });
  suggestionsUI.suggestionsService = suggestionsService;

  // Колбэк открытия дерева при клике на стрелку в подсказке
  suggestionsUI.onTreeOpen = async (item) => {
    // item — это выбранный объект с KR_NAIM, CODE и т.д.
    // Можно при открытии дерева что-то делать с item,
    // например, вывести в консоль
    console.log("Открыть дерево для:", item);
    await tnvedTreeUI.open();
  };

  // Инициализация дерева
  const tnvedTreeUI = new TnvedTreeUI({
    treeContainer: treeContainer,
    overlay: overlay,
    closeButton: closeButton,
    treeList: treeList,
  });
  tnvedTreeUI.treeService = tnvedTreeService;

  // Запуск
  suggestionsUI.init();
  tnvedTreeUI.init();
});
