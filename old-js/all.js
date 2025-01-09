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

  extractYuanRate(text) {
    const match = text.match(
      /курс\s([\d.,]+)\s*\/\s*([\d.,]+)\s*\/\s*([\d.,]+)\s*ю/i
    );
    if (match) {
      this.currencyYuan = parseFloat(match[2].replace(",", "."));
    } else {
      throw new Error("Не удалось извлечь курс юаня из текста");
    }
  }

  calculateDollarRate() {
    if (this.currencyYuan !== null) {
      this.currencyRuble = parseFloat(
        (this.currencyYuan * this.multiplier).toFixed(2)
      );
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
    chosenCodeImp: 10, // пусть по умолчанию 10
  },

  cbrRates: {
    dollar: 100,
    yuan: 14,
  },

  setDirectionData(direction, data) {
    this.directionsData[direction] = data;
  },

  getDirectionData(direction) {
    return this.directionsData[direction] || null;
  },

  updateRates(dollar, yuan) {
    this.cbrRates.dollar = dollar;
    this.cbrRates.yuan = yuan;
  },
};
// uiController.js
import { State } from "../data/State.js";

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

  /**
   * showResults
   * @param {Array}  results - [{cost, pricePerKg, calculationMode}, ...] для auto/train/avia
   * @param {Object} data - все входные/выходные параметры, включая:
   *
   *   calcType: 'calc-cargo' | 'calc-customs'
   *
   *   // Данные от пользователя:
   *   totalCost,            // Сумма, которую ввёл пользователь
   *   selectedCurrency,     // 'dollar' | 'ruble' | 'yuan'
   *   costInDollar,         // totalCost в долларах (переведён DeliveryCalculator)
   *   totalVolume,
   *   totalWeight,
   *   quantity,
   *   density,
   *   categoryKey,          // Если cargo
   *   packagingCost,
   *   brandIncluded,
   *   packingTypeValue,
   *
   *   // Курсы:
   *   currencyRuble, // Wisetao
   *   currencyYuan,  // Wisetao
   *   cbrRuble,      // ЦБ
   *   cbrYuan,       // ЦБ
   *
   *   // Тамож. данные (если calc-customs):
   *   dutyValue,   // % пошлины (например, 15)
   *   ndsValue,    // % НДС, обычно 20
   *   declRub,     // услуги декларации в рублях
   *   totalAllDollar, // Перевозка+таможня в $
   *   totalAllRub,    // Перевозка+таможня в ₽
   *
   *   // Методы:
   *   calculateInsuranceCost,
   *   calculateTotalCost
   */
  static showResults(results, data) {
    const {
      calcType, // 'calc-cargo' | 'calc-customs'
      totalCost,
      selectedCurrency,
      costInDollar,
      totalVolume,
      totalWeight,
      quantity,
      density,
      categoryKey,
      packagingCost,
      brandIncluded,
      packingTypeValue,

      // Курсы
      currencyRuble, // Wisetao
      currencyYuan, // Wisetao
      cbrRuble,
      cbrYuan,

      // Таможня (если calc-customs)
      dutyValue,
      ndsValue, // если надо, по умолчанию 20
      declRub,
      totalAllDollar,
      totalAllRub,

      calculateInsuranceCost,
      calculateTotalCost,
    } = data;

    // Массив направлений
    const directionKeys = ["auto", "train", "avia"];

    // Для расширенного вывода в консоль подготовим массив строк
    const bigConsoleRows = [];

    // Перебираем все три направления
    results.forEach((res, idx) => {
      // Определяем ключ направления: auto | train | avia
      const directionName = directionKeys[idx];
      // Как считаем: weight | volume
      const calculationMode =
        res?.calculationMode === "weight" ? "по весу" : "по объему";

      // Само значение перевозки (в долларах)
      const shippingCostDollar = parseFloat(res?.cost || 0);

      // Считаем «за КГ»
      let pricePerKgDollar, pricePerKgRuble;
      if (calculationMode === "по объему") {
        // shipping / totalWeight
        pricePerKgDollar = shippingCostDollar / (totalWeight || 1);
      } else {
        // res.pricePerKg
        pricePerKgDollar = parseFloat(res?.pricePerKg || 0);
      }
      pricePerKgDollar = +pricePerKgDollar.toFixed(2); // округлим
      pricePerKgRuble = +(pricePerKgDollar * currencyRuble).toFixed(2);

      // Считаем страховку (в долларах)
      const insuranceUsd = calculateInsuranceCost(
        shippingCostDollar,
        costInDollar
      );
      const insuranceCostDollar = +insuranceUsd.toFixed(2);

      // CARGO-сумма (shipping + packaging + insurance)
      const cargoUsd = calculateTotalCost(
        shippingCostDollar,
        packagingCost,
        insuranceCostDollar
      );
      const cargoDollar = +cargoUsd.toFixed(2);
      const cargoRuble = +(cargoUsd * currencyRuble).toFixed(2);

      // Если calc-cargo => показываем cargo
      // Если calc-customs => показываем totalAllDollar / totalAllRub
      let finalDollar = 0;
      let finalRuble = 0;
      if (calcType === "calc-cargo") {
        finalDollar = cargoDollar;
        finalRuble = cargoRuble;
      } else {
        // calc-customs => суммарная величина (если DeliveryCalculator уже сложил всё)
        finalDollar = parseFloat(totalAllDollar || 0);
        finalRuble = parseFloat(totalAllRub || 0);
      }

      // Сохраняем данные в State (для PDF)
      State.setDirectionData(directionName, {
        currencyYuan,
        currencyRuble,
        costInDollar,
        totalCostFinalDollar: finalDollar,
        totalCostFinalRuble: finalRuble,
        totalVolume,
        totalWeight,
        quantity,
        pricePerKgDollar: pricePerKgDollar.toFixed(2),
        pricePerKgRuble: pricePerKgRuble.toFixed(2),
        packingTypeValue,
        packagingCost,
        insuranceCostDollar,
      });

      // Собираем строку для console.table
      bigConsoleRows.push({
        Направление: directionName,
        Калькуляция: calcType,
        "Входная сумма (польз.)": `${totalCost} ${selectedCurrency}`,
        "В $ (costInDollar)": `${costInDollar.toFixed(2)}$`,
        "Объём (m³)": totalVolume,
        "Вес (кг)": totalWeight,
        Количество: quantity,
        Плотность: density,
        "Категория груза": categoryKey || "(—)",
        TarifMode: calculationMode,
        "Перевозка($)": shippingCostDollar.toFixed(2),
        "Price/kg($)": pricePerKgDollar.toFixed(2),
        "Упаковка($)": packagingCost.toFixed(2),
        "Страховка($)": insuranceCostDollar.toFixed(2),
        "Итог(CARGO)($)": `${cargoDollar.toFixed(2)}`,
        "Итог(CARGO)(₽)": `${cargoRuble.toFixed(2)}`,
        "Итог(RES)($)": finalDollar.toFixed(2),
        "Итог(RES)(₽)": finalRuble.toFixed(2),
      });

      // --- Обновляем DOM ---
      const priceBlock = document.querySelector(`.price-${directionName}`);
      if (!priceBlock) return;
      const kgDollarEl = priceBlock.querySelector(".calculate-result__kg");
      const kgRubleEl = priceBlock.querySelector(".calculate-result__kg_ruble");
      if (kgDollarEl) kgDollarEl.textContent = pricePerKgDollar.toFixed(2);
      if (kgRubleEl) kgRubleEl.textContent = pricePerKgRuble.toFixed(2);

      const dollarEl = priceBlock.querySelector(".calculate-result__dollar");
      const rubleEl = priceBlock.querySelector(".calculate-result__ruble");
      if (dollarEl) dollarEl.textContent = finalDollar.toFixed(2);
      if (rubleEl) rubleEl.textContent = finalRuble.toFixed(2);

      // Найдём tooltip (каждый блок .price-cell -> .overflow-info)
      const overflowInfo = priceBlock
        .closest(".price-cell")
        ?.querySelector(".overflow-info");
      if (!overflowInfo) return;
      const tooltip = overflowInfo.querySelector(".main-calc-result-tooltip");
      if (!tooltip) return;

      // Заголовок
      const tooltipTitle = tooltip.querySelector(
        ".main-calc-result-tooltip__title"
      );
      const whiteBlock = tooltip.querySelector(
        ".main-calc-result-tooltip__white"
      );

      // Курс: ._number._ruble, ._number._yuan
      const rubleSpan = tooltip.querySelector("._number._ruble");
      const yuanSpan = tooltip.querySelector("._number._yuan");

      // Итого(CARGO):
      const cargoDollarEl = tooltip.querySelector("._all-cargo-dollar");
      const cargoRubleEl = tooltip.querySelector("._all-cargo-ruble");

      // Таможня:
      const chosenImpEl = tooltip.querySelector("._chosen-imp");
      const ndsEl = tooltip.querySelector("._nds");
      const declDollarEl = tooltip.querySelector("._decloration-dollar");
      const declRubleEl = tooltip.querySelector("._decloration-ruble");
      const allWhiteDollarEl = tooltip.querySelector("._all-white-dollar");
      const allWhiteRubleEl = tooltip.querySelector("._all-white-ruble");
      const allCalculatedDollarEl = tooltip.querySelector(
        "._all-calculated-price-dollar"
      );
      const allCalculatedRubleEl = tooltip.querySelector(
        "._all-calculated-price-ruble"
      );

      // Заполняем поля
      if (calcType === "calc-cargo") {
        // 1) Заголовок
        if (tooltipTitle) {
          tooltipTitle.textContent =
            "Только до терминала ТК “Южные ворота” Москва";
        }
        // 2) Скрыть тамож. блок
        if (whiteBlock) {
          whiteBlock.classList.remove("active");
        }
        // 3) Курс Wisetao
        if (rubleSpan)
          rubleSpan.textContent = currencyRuble?.toFixed?.(2) || "0.00";
        if (yuanSpan)
          yuanSpan.textContent = currencyYuan?.toFixed?.(2) || "0.00";
        // 4) Итого (CARGO)
        if (cargoDollarEl)
          cargoDollarEl.textContent = cargoDollar.toFixed(2) + "$";
        if (cargoRubleEl)
          cargoRubleEl.textContent = cargoRuble.toFixed(2) + "₽";
      } else {
        // calc-customs
        if (tooltipTitle) {
          tooltipTitle.textContent = "Доставка только до г.Благовещенск СВХ";
        }
        if (whiteBlock) {
          whiteBlock.classList.add("active");
        }
        // Курс ЦБ
        if (rubleSpan) rubleSpan.textContent = cbrRuble?.toFixed?.(2) || "0.00";
        if (yuanSpan) yuanSpan.textContent = cbrYuan?.toFixed?.(2) || "0.00";

        // Пошлина
        if (chosenImpEl && dutyValue !== undefined) {
          chosenImpEl.textContent = dutyValue + "%";
        }
        // НДС
        if (ndsEl && ndsValue !== undefined) {
          ndsEl.textContent = ndsValue + "%";
        }
        // 550 юаней (declRub) => в $?
        if (declDollarEl && declRubleEl && declRub !== undefined) {
          // declRub уже в рублях => declRub / cbrRuble => $
          const decDollar = cbrRuble > 0 ? declRub / cbrRuble : 0;
          declDollarEl.textContent = decDollar.toFixed(2) + "$";
          declRubleEl.textContent = declRub.toFixed(2) + "₽";
        }
        // ._all-white-dollar/._all-white-ruble => таможня (duty+nds+dec) минус исходная стоим.
        if (allWhiteDollarEl && allWhiteRubleEl) {
          // допустим totalAllDollar - cargoDollar = чисто тамож.часть
          // но вы можете передавать отдельное поле totalCustomsDollar/totalCustomsRub
          const customsDollarOnly = (totalAllDollar || 0) - cargoDollar;
          const customsRubleOnly = (totalAllRub || 0) - cargoRuble;
          allWhiteDollarEl.textContent = customsDollarOnly.toFixed(2) + "$";
          allWhiteRubleEl.textContent = customsRubleOnly.toFixed(2) + "₽";
        }
        // "Перевозка + Таможенные расходы" => ._all-calculated-price-dollar/._ruble
        if (allCalculatedDollarEl && allCalculatedRubleEl) {
          const finalDollarStr = (totalAllDollar || 0).toFixed(2);
          const finalRubleStr = (totalAllRub || 0).toFixed(2);
          allCalculatedDollarEl.textContent = finalDollarStr + "$";
          allCalculatedRubleEl.textContent = finalRubleStr + "₽";
        }
      }
    }); // end forEach

    // Выводим *все* строки в консоль
    console.table(bigConsoleRows);

    // Активируем общий блок .main-calc-result
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
// DeliveryCalculator.js
import { CONFIG } from "../config.js";
import { UIController } from "../ui/ui-controller.js";
import { State } from "../data/State.js";

export class DeliveryCalculator {
  constructor(
    jsonLoader,
    wisetaoRuble,
    wisetaoYuan,
    cbrRuble,
    cbrYuan,
    fields
  ) {
    this.jsonLoader = jsonLoader;
    this.fields = fields;

    // Курсы Wisetao (для calc-cargo)
    this.wisetaoRuble = wisetaoRuble;
    this.wisetaoYuan = wisetaoYuan;

    // Курсы ЦБ (для calc-customs)
    this.cbrRuble = cbrRuble;
    this.cbrYuan = cbrYuan;

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
      // Включили «Ввести объём напрямую»
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

    const calcVol = (length * width * height) / 1_000_000;
    totalVolumeCalculated.value = calcVol > 0 ? calcVol.toFixed(4) : "";
  }

  /**
   * Конвертирует введённую стоимость (totalCost) в доллары
   * на базе выбранной валюты (selectedCurrency)
   * и курсов currentRuble/currentYuan.
   */
  convertToDollar(totalCost, selectedCurrency, currentRuble, currentYuan) {
    if (selectedCurrency === "ruble") {
      return totalCost / currentRuble;
    } else if (selectedCurrency === "yuan") {
      return totalCost / currentYuan;
    }
    // Если 'dollar'
    return totalCost; // уже в долларах
  }

  calculateDensity(totalWeight, totalVolume) {
    if (totalVolume <= 0) {
      UIController.showError("Объём должен быть больше нуля");
      return null;
    }
    return totalWeight / totalVolume;
  }

  // Старая логика для calc-cargo: смотрим JSON, ищем тариф
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
   * Упрощённая логика для calc-customs (0.6$/кг) для всех направлений
   */
  calculateCustoms(totalWeight) {
    const directions = ["auto", "train", "avia"];
    return directions.map(() => {
      const shippingCost = totalWeight * 0.6;
      return {
        cost: shippingCost,
        pricePerKg: 0.6,
        calculationMode: "weight",
      };
    });
  }

  /**
   * Метод, который ищет в JSON нужный тариф (в $ за кг)
   * с учётом плотности (если cargo)
   */
  calculateShippingCostForDirection(
    direction,
    categoryKey,
    density,
    weight,
    volume
  ) {
    const directionData = this.jsonLoader.getDirectionData(direction);
    if (!directionData) {
      UIController.showError(`Нет данных для направления "${direction}".`);
      return { cost: 0, pricePerKg: 0, calculationMode: null };
    }

    // ищем «rangeData»
    let calculationMode = "";
    let rangeData = null;

    if (direction === "train") {
      // Тарифы лежат прямо в массиве directionData
      rangeData = directionData.find((rd) => {
        const [min, max] = rd.weight_range
          .split("-")
          .map((val) => (val === "" ? Infinity : parseFloat(val) || 0));
        return density >= min && density <= max;
      });
      calculationMode = density >= 200 ? "weight" : "volume";
    } else {
      // auto / avia => сначала ищем категорию
      let catData;
      if (direction === "avia") {
        catData =
          directionData.find((cat) => cat.category_key === categoryKey) ||
          directionData.find((cat) => cat.category_key === "others");
      } else {
        // auto
        catData = directionData.find((cat) => cat.category_key === categoryKey);
      }
      if (!catData) {
        UIController.showError(
          `Категория ${categoryKey} не найдена для ${direction}`
        );
        return { cost: 0, pricePerKg: 0, calculationMode: null };
      }

      // catData.data => массив весовых диапазонов
      rangeData = catData.data?.find((rd) => {
        const [min, max] = rd.weight_range
          .split("-")
          .map((val) => (val === "" ? Infinity : parseFloat(val) || 0));
        return density >= min && density <= max;
      });
      calculationMode = density >= 100 ? "weight" : "volume";
    }

    if (!rangeData) {
      UIController.showError(
        `Не найден подходящий тариф для ${direction}, плотность: ${density}`
      );
      return { cost: 0, pricePerKg: 0, calculationMode: null };
    }

    let pricePerKg = rangeData.price_kg;
    // Доплата за бренд (если включено):
    if (this.fields.brand?.checked) {
      // Если плотность >= 100 => +0.5$/кг, иначе +50$/куб
      pricePerKg += density >= 100 ? 0.5 : 50;
    }

    const cost =
      calculationMode === "weight" ? pricePerKg * weight : pricePerKg * volume;

    return { cost, pricePerKg, calculationMode };
  }

  /**
   * Считаем упаковку (packingType)
   */
  calculatePackagingCost(packingType, volume, quantity) {
    const packaging = this.jsonLoader.getPackagingData(packingType);
    if (!packaging) {
      UIController.showError("Не найдена упаковка " + packingType);
      return 0;
    }
    const standardPack = this.jsonLoader.getPackagingData("std_pack");
    if (!standardPack) {
      UIController.showError("Не найдена упаковка std_pack");
      return 0;
    }

    // Сколько стоит эта упаковка
    const mainCost =
      packaging.which === "place"
        ? packaging.price * quantity
        : packaging.price * volume;
    // И сколько стоит стандартная упаковка (она добавляется, если не «std_pack»)
    const stdCost =
      standardPack.which === "place"
        ? standardPack.price * quantity
        : standardPack.price * volume;

    // если выбрано «std_pack» => не надо прибавлять stdCost
    if (packingType === "std_pack") {
      return mainCost;
    }
    return mainCost + stdCost;
  }

  /**
   * Страховка
   */
  calculateInsuranceCost(shippingCost, goodsCostDollar) {
    // Пример: 3% от (доставка + стоимость товара)
    // или rate=0.03 => CONFIG.insuranceRate
    const rate = CONFIG.insuranceRate;
    return this.fields.insurance.checked
      ? (shippingCost + goodsCostDollar) * rate
      : 0;
  }

  /**
   * Cумма (доставка + упаковка + страховка)
   */
  calculateTotalCost(shippingCost, packagingCost, insuranceCost) {
    return shippingCost + packagingCost + insuranceCost;
  }

  /**
   * Дополнительный метод: считаем «таможенные расходы»
   * @param {number} costInDollar  — стоимость товара в $ (которую ввёл клиент)
   * @param {number} dutyValuePct  — процент пошлины (например, 15%)
   * @param {number} cbrRateDollar — например, 100 руб/долл
   * @param {number} cbrRateYuan   — например, 15 руб/юань
   * @returns {object} { totalCustomsDollar, decDollar, totalCustomsRub, ...}
   */
  calculateCustomsCost(costInDollar, dutyValuePct, cbrRateDollar, cbrRateYuan) {
    // 1) Пошлина: dutyValuePct% от стоимости
    const dutyDollar = (dutyValuePct / 100) * costInDollar;

    // 2) Сумма с пошлиной
    const sumWithDutyDollar = costInDollar + dutyDollar;

    // 3) НДС = 20% от sumWithDutyDollar
    const ndsDollar = sumWithDutyDollar * 0.2; // или храните 0.2 в config

    // 4) Услуги декларации: 550 юаней => сколько это в долларах?
    //   если cbrRateYuan=15 руб/юань, cbrRateDollar=100 руб/долл
    //   тогда 1$=100 руб, 1¥=15 руб => 1$= (100/15)¥ => 1¥= (15/100)$=0.15$
    //   => 550¥ = 550*(15/100)$ = 82.5$
    // Упрощённо:
    const decDollar = (550 * cbrRateYuan) / cbrRateDollar;

    // 5) Итого всё (пошлина+ндс+декларация), но вычитаем «исходную сумму товара»
    //   чтобы получить чисто «таможенные затраты»
    //   либо можно оставить «всю сумму»: costInDollar + dutyDollar + ndsDollar + decDollar
    //   часто хотят показать, насколько дороже стало
    const totalCustomsDollar =
      costInDollar + dutyDollar + ndsDollar + decDollar - costInDollar;

    // 6) Переводим всё в рубли
    const totalCustomsRub = totalCustomsDollar * cbrRateDollar;
    const decRub = decDollar * cbrRateDollar;
    // dutyRub/ndsRub по аналогии
    const dutyRub = dutyDollar * cbrRateDollar;
    const ndsRub = ndsDollar * cbrRateDollar;

    return {
      dutyDollar,
      ndsDollar,
      decDollar,
      dutyRub,
      ndsRub,
      decRub,
      totalCustomsDollar,
      totalCustomsRub,
    };
  }

  async calculate() {
    try {
      // 1) Узнаём тип режима (calc-cargo | calc-customs)
      const calcTypeRadio = document.querySelector(
        'input[name="calc-type"]:checked'
      );
      const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";

      // Для cargo берём wisetao-курсы, для customs — cbr-курсы
      let currentRuble, currentYuan;
      if (calcType === "calc-cargo") {
        currentRuble = this.wisetaoRuble;
        currentYuan = this.wisetaoYuan;
      } else {
        currentRuble = this.cbrRuble;
        currentYuan = this.cbrYuan;
      }

      // 2) Собираем данные, которые ввёл пользователь
      const totalCostUser = parseFloat(this.fields.totalCost.value) || 0; // то, что ввёл
      const totalWeight = parseFloat(this.fields.totalWeight.value) || 0;
      const totalVolume = this.fields.weightVolumeChange.checked
        ? parseFloat(this.fields.totalVolume.value) || 0
        : parseFloat(this.fields.totalVolumeCalculated.value) || 0;

      // Выбранная валюта (dollar/ruble/yuan)
      const selCurEl = document.querySelector(
        'input[name="total_currecy"]:checked'
      );
      const selectedCurrency = selCurEl ? selCurEl.value : "dollar";

      // Конвертируем totalCost в доллары (на основе курсов)
      const costInDollar = this.convertToDollar(
        totalCostUser,
        selectedCurrency,
        currentRuble,
        currentYuan
      );

      // Далее будем считать отдельно:
      let results; // [{cost, pricePerKg, calculationMode},...]
      let density = 0;
      let categoryKey = "";

      if (calcType === "calc-cargo") {
        // Карго
        // 1) узнаём категорию
        const catKeyEl = Array.from(this.fields.category).find(
          (c) => c.checked
        );
        if (!catKeyEl) {
          UIController.showError("Не выбрана категория для карго!");
          return;
        }
        categoryKey = catKeyEl.value;

        // 2) плотность
        density = this.calculateDensity(totalWeight, totalVolume);
        if (density === null) return; // ошибка уже показана

        // 3) Считаем доставку
        results = this.calculateCargo(
          categoryKey,
          density,
          totalWeight,
          totalVolume
        );
      } else {
        // Белая доставка (0.6$/кг)
        results = this.calculateCustoms(totalWeight);
      }

      // Упаковка
      const packingTypeEl = document.querySelector(
        'input[name="packing-type"]:checked'
      );
      if (!packingTypeEl) {
        UIController.showError("Упаковка не выбрана!");
        return;
      }
      const packingType = packingTypeEl.value;
      const packagingCost = this.calculatePackagingCost(
        packingType,
        totalVolume,
        parseInt(this.fields.quantity.value, 10)
      );

      // 3) Если calc-customs, то нужно посчитать тамож. расходы
      let customsObj = null; // результат calculateCustomsCost
      if (calcType === "calc-customs") {
        // Предположим, State.tnvedSelection.chosenCodeImp — % пошлины
        const dutyValuePct = State.tnvedSelection.chosenCodeImp || 10;

        // Считаем всё
        customsObj = this.calculateCustomsCost(
          costInDollar, // costInDollar
          dutyValuePct, // процент пошлины
          this.cbrRuble, // сколько руб / $
          this.cbrYuan // сколько руб / ¥
        );
      }

      // Логика вывода
      //  - Расходы на доставку cargo (results),
      //  - если calc-customs => складываем "стоимость доставки" + "тамож.расходы"
      //    или отдельный объект data для UI

      // 4) Подготовим данные для UIController
      //    Если calc-cargo: таможенные поля = null
      //    Если calc-customs: таможенные поля = customsObj
      const dataForUI = {
        calcType, // 'calc-cargo' | 'calc-customs'
        totalCost: totalCostUser,
        selectedCurrency, // dollar/ruble/yuan
        costInDollar, // totalCostUser, но в $
        totalVolume,
        totalWeight,
        quantity: parseInt(this.fields.quantity.value, 10),
        density,
        categoryKey,
        packagingCost, // (доллары)
        brandIncluded: this.fields.brand?.checked && calcType === "calc-cargo",
        packingTypeValue: packingType,

        // Курсы: Wisetao (cargo) и CBR (customs)
        currencyRuble: this.wisetaoRuble,
        currencyYuan: this.wisetaoYuan,
        cbrRuble: this.cbrRuble,
        cbrYuan: this.cbrYuan,

        calculateInsuranceCost: this.calculateInsuranceCost.bind(this),
        calculateTotalCost: this.calculateTotalCost.bind(this),
      };

      // Если есть таможенные данные, добавим их
      if (calcType === "calc-customs" && customsObj) {
        // Посчитаем «Итог перевозки»:
        //   results[0].cost = доставка auto
        //   results[1].cost = train
        //   results[2].cost = avia
        //   …но обычно выбирают одно из направлений (auto/train/avia).
        //   если нужно общую сумму, можно взять, напр., results[0].cost
        //   или показать для каждого
        //   А если пользователь будет дальше выбирать?
        // Для примера возьмём auto => results[0].cost
        //   (или можно для каждого сложить: results[i].cost + customsObj.totalCustomsDollar)
        // «Перевозка + таможка» = shippingCost + customsObj.totalCustomsDollar.
        // Но лучше всё это делать в UI на каждый direction.
        // Для примера оставлю aggregated:
        const shippingDollarAuto = results[0].cost; // можно idx=0 (auto)
        // Переводим в рубли:
        const shippingRubAuto = shippingDollarAuto * this.cbrRuble;
        // Итого (доставка + таможня) в долларах + рублях:
        const totalAllDollar =
          shippingDollarAuto + customsObj.totalCustomsDollar;
        const totalAllRub = shippingRubAuto + customsObj.totalCustomsRub;

        // Дополнительные поля для UI
        dataForUI.dutyValue = State.tnvedSelection.chosenCodeImp || 10;
        dataForUI.dutyUsd = customsObj.dutyDollar;
        dataForUI.ndsUsd = customsObj.ndsDollar;
        dataForUI.decDollar = customsObj.decDollar;
        dataForUI.dutyRub = customsObj.dutyRub;
        dataForUI.ndsRub = customsObj.ndsRub;
        dataForUI.decRub = customsObj.decRub;
        dataForUI.totalCustomsDollar = customsObj.totalCustomsDollar;
        dataForUI.totalCustomsRub = customsObj.totalCustomsRub;

        dataForUI.totalAllDollar = totalAllDollar;
        dataForUI.totalAllRub = totalAllRub;
      }

      // Вызываем UI
      UIController.showResults(results, dataForUI);

      // В конец можно вывести полную отладочную таблицу в консоль:
      console.table({
        ТипРасчёта: calcType,
        totalCostUser,
        selectedCurrency,
        costInDollar: costInDollar.toFixed(2),
        totalVolume,
        totalWeight,
        packagingCost: packagingCost.toFixed(2),
        brandIncluded: !!this.fields.brand?.checked,
        packingTypeValue: packingType,
        wisetaoRuble: this.wisetaoRuble,
        wisetaoYuan: this.wisetaoYuan,
        cbrRuble: this.cbrRuble,
        cbrYuan: this.cbrYuan,
        categoryKey,
        density,
        // Если есть customsObj, тоже выведем:
        customsObj,
      });
    } catch (err) {
      UIController.showError("Ошибка в расчёте: " + err.message);
      console.error(err);
    }
  }
}
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
    this.DEBOUNCE_DELAY = 500;
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
// main.js
import { CONFIG } from "./config.js";
import { TelegramGroupInfo } from "./api/TelegramGroupInfo.js";
import { CurrencyParser } from "./calculations/CurrencyParser.js";
import { JsonDataLoader } from "./data/JsonDataLoader.js";
import { CalculatorValidation } from "./calculations/CalculatorValidation.js";
import { DeliveryCalculator } from "./calculations/DeliveryCalculator.js";
import { UIController } from "./ui/ui-controller.js";
import { State } from "./data/State.js";

async function getCbrRates() {
  const response = await fetch("https://www.cbr-xml-daily.ru/daily_json.js");
  const data = await response.json();
  const usdToRub = parseFloat(data.Valute.USD.Value).toFixed(2);
  const cnyToRub = parseFloat(data.Valute.CNY.Value).toFixed(2);

  return {
    currencyCbRuble: usdToRub,
    currencyCbYuan: cnyToRub,
  };
}

(async () => {
  const groupInfo = new TelegramGroupInfo(CONFIG.botToken, CONFIG.chatId);
  const groupName = await groupInfo.getGroupName();

  let wisetaoYuan; // было currencyYuan
  let wisetaoRuble; // было currencyRuble

  let cbrYuan; // было currencyCbYuan
  let cbrRuble; // было currencyCbRuble

  if (groupName) {
    const currencyParser = new CurrencyParser();
    try {
      currencyParser.parseAndCalculate(groupName);
      wisetaoYuan = currencyParser.getYuanRate(); // бывший currencyYuan
      wisetaoRuble = currencyParser.getDollarRate(); // бывший currencyRuble
      console.log(`Wisetao: 1¥ = ${wisetaoYuan} рубль`);
      console.log(`Wisetao: 1$ = ${wisetaoRuble} рубль`);
    } catch (error) {
      UIController.showError(
        "Не удалось получить курс валют: " + error.message
      );
    }
  } else {
    UIController.showError("Не удалось получить имя группы.");
  }

  // Получаем курсы валют от ЦБ РФ
  try {
    const cbrRates = await getCbrRates();
    cbrRuble = cbrRates.currencyCbRuble; // допустим "75.50"
    cbrYuan = cbrRates.currencyCbYuan; // допустим  "10.20"

    // Обновляем State с курсами от ЦБ
    State.updateRates(cbrRuble, cbrYuan);

    console.log(`Курс ЦБ: 1$ = ${State.cbrRates.dollar} рубль`);
    console.log(`Курс ЦБ: 1¥ = ${State.cbrRates.yuan} рубль`);
  } catch (error) {
    UIController.showError(
      "Не удалось получить курс валют от ЦБ: " + error.message
    );
  }

  if (!wisetaoYuan || !wisetaoRuble || !cbrYuan || !cbrRuble) {
    UIController.showError("Курсы валют не загружены, расчет невозможен.");
    return;
  }

  // Узнаём, какая радиокнопка сейчас выбрана
  const defaultCalcTypeRadio = document.querySelector(
    'input[name="calc-type"]:checked'
  );
  if (defaultCalcTypeRadio && defaultCalcTypeRadio.value === "calc-customs") {
    // Показываем cbr:
    document.querySelector('input[name="current_rate_ruble"]').value = cbrRuble;
    document.querySelector('input[name="current_rate_yuan"]').value = cbrYuan;
  } else {
    // Показываем wisetao:
    document.querySelector('input[name="current_rate_ruble"]').value =
      wisetaoRuble;
    document.querySelector('input[name="current_rate_yuan"]').value =
      wisetaoYuan;
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

    wisetaoRuble,
    wisetaoYuan,

    cbrRuble,
    cbrYuan,
    fields
  );
  const validation = new CalculatorValidation(fields);

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

  // Собираем все поля, которые при изменении должны сбрасывать результат
  const allFieldsToReset = [
    fields.totalCost,
    fields.totalWeight,
    fields.totalVolume,
    fields.totalVolumeCalculated,
    fields.volumeLength,
    fields.volumeWidth,
    fields.volumeHeight,
    fields.tnvedInput,
    fields.brand,
  ];

  allFieldsToReset.forEach((fld) => {
    if (!fld) return;
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
      validation.clearErrors();
      const allFields = Object.values(allFieldsToReset);
      validation.clearFields(allFields);

      // --- НОВЫЙ КОД: заменяем курс в полях
      if (radio.value === "calc-cargo") {
        // Используем wisetaoRuble / wisetaoYuan
        document.querySelector('input[name="current_rate_ruble"]').value =
          wisetaoRuble;
        document.querySelector('input[name="current_rate_yuan"]').value =
          wisetaoYuan;
      } else {
        // Используем cbrRuble / cbrYuan
        document.querySelector('input[name="current_rate_ruble"]').value =
          cbrRuble;
        document.querySelector('input[name="current_rate_yuan"]').value =
          cbrYuan;
      }
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
