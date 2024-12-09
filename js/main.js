// Класс для работы с JSON-данными
class JsonDataLoader {
  constructor(jsonPath) {
    this.jsonPath = jsonPath; // Путь к JSON-файлу
    this.data = null; // Хранение загруженных данных
  }

  // Метод для загрузки JSON
  async load() {
    try {
      const response = await fetch(this.jsonPath);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      this.data = await response.json();
      console.log("Данные JSON успешно загружены:", this.data);
    } catch (error) {
      console.error("Ошибка загрузки JSON:", error);
    }
  }

  // Получение данных для направления
  // Получение данных для направления
  getDirectionData(directionKey) {
    if (
      !this.data ||
      !this.data.categories ||
      !this.data.categories[directionKey]
    ) {
      console.error(`Данные для направления "${directionKey}" не найдены`);
      return null;
    }
    return this.data.categories[directionKey];
  }

  // Получение данных по категории для авто
  getCategoryData(categoryKey) {
    const autoData = this.getDirectionData("auto");
    if (!autoData || !autoData.categories) {
      console.error("Данные для категории авто не найдены");
      return null;
    }
    return autoData.categories.find(
      (category) => category.category_key === categoryKey
    );
  }

  // Получение тарифа для направления train
  getTrainRates() {
    return this.getDirectionData("train");
  }

  // Получение тарифа для avia
  getAviaRates() {
    return this.getDirectionData("avia");
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

        if (parts[1]?.length > 4) {
          field.value = `${parts[0]}.${parts[1].substring(0, 4)}`;
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

  calculateDensity(totalWeight, totalVolume) {
    if (totalVolume > 0) {
      const density = (totalWeight / totalVolume).toFixed(2);
      console.log(`Рассчитанная плотность: ${density}`);
      return density;
    }
    console.error("Объем должен быть больше нуля");
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
      console.error(`Данные для направления ${direction} отсутствуют.`);
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
      console.error(
        `Не удалось найти подходящий тариф для направления ${direction} и плотности ${density}.`
      );
      return { cost: 0, pricePerKg: 0, calculationMode: null };
    }

    const cost =
      calculationMode === "weight"
        ? weight * rangeData.price_kg
        : volume * rangeData.price_kg;

    return { cost, pricePerKg: rangeData.price_kg, calculationMode };
  }

  updateResults(result, priceBlockName, calculationMode) {
    const { cost, pricePerKg } = result;

    const priceBlock = document.querySelector(`.${priceBlockName}`);
    if (!priceBlock) return;

    priceBlock.querySelector(".calculate-result__kg").textContent =
      pricePerKg.toFixed(2);
    priceBlock.querySelector(".calculate-result__kg_ruble").textContent = (
      pricePerKg * this.currencyRuble
    ).toFixed(2);

    priceBlock.querySelector(".calculate-result__dollar").textContent =
      cost.toFixed(2);
    priceBlock.querySelector(".calculate-result__ruble").textContent = (
      cost * this.currencyRuble
    ).toFixed(2);

    const titleTarifElement = priceBlock.querySelector(
      ".calculate-result__title_tarif"
    );
    if (titleTarifElement) {
      titleTarifElement.textContent =
        calculationMode === "weight" ? "За КГ:" : "За м³:";
    }
  }

  async calculate() {
    try {
      const totalCost = parseFloat(this.fields.totalCost.value) || 0;
      const totalWeight = parseFloat(this.fields.totalWeight.value) || 0;
      const totalVolume = this.fields.weightVolumeChange.checked
        ? parseFloat(this.fields.totalVolume.value) || 0
        : parseFloat(this.fields.totalVolumeCalculated.value) || 0;

      // Находим категорию
      const categoryKeyElement = Array.from(this.fields.category).find(
        (field) => field.checked
      );
      if (!categoryKeyElement) {
        console.error("Категория не выбрана!");
        const errorSpan = document.querySelector(".error-message-category");
        const errorBlock = document.querySelector(".js-error-category");

        if (errorSpan && errorBlock) {
          errorSpan.textContent = "Необходимо выбрать категорию";
          errorBlock.classList.add("active");
        }
        return;
      }

      const categoryKey = categoryKeyElement.value;

      // Рассчитываем плотность
      const density = this.calculateDensity(totalWeight, totalVolume);
      if (!density) {
        console.error("Невозможно рассчитать плотность!");
        return;
      }

      // Расчёт стоимости по направлениям
      const resultAuto = this.calculateShippingCostForDirection(
        "auto",
        categoryKey,
        density,
        totalWeight,
        totalVolume
      );
      if (resultAuto) {
        this.updateResults(
          resultAuto,
          "price-auto",
          resultAuto.calculationMode
        );
      }

      const resultTrain = this.calculateShippingCostForDirection(
        "train",
        categoryKey,
        density,
        totalWeight,
        totalVolume
      );
      if (resultTrain) {
        this.updateResults(
          resultTrain,
          "price-train",
          resultTrain.calculationMode
        );
      }

      const resultAvia = this.calculateShippingCostForDirection(
        "avia",
        categoryKey,
        density,
        totalWeight,
        totalVolume
      );
      if (resultAvia) {
        this.updateResults(
          resultAvia,
          "price-avia",
          resultAvia.calculationMode
        );
      }
    } catch (error) {
      console.error("Ошибка в методе calculate:", error);
    }
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

  const jsonLoader = new JsonDataLoader("./js/rates.json");
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
