// FormValidation.js
import { State } from "../data/State.js";

export class FormValidation {
  constructor(fields) {
    this.fields = fields;
    this.errors = {};

    // Поля, которые нужно очистить при переключении calc-type:
    this.fieldsToReset = [
      this.fields.totalCost,
      this.fields.totalWeight,
      this.fields.totalVolume,
      this.fields.totalVolumeCalculated,
      this.fields.volumeLength,
      this.fields.volumeWidth,
      this.fields.volumeHeight,
      this.fields.tnvedInput,
      this.fields.brand,
    ];

    // -- Базовая валидация --
    this.setupInputRestrictions(); // (1) Ограничение ввода для totalVolume, totalWeight, ...
    this.setupRealtimeValidation(); // (2) Реалтайм-валидация и т.п.
    this.setupCalcTypeReset(); // (3) Сброс при переключении calc-type

    // -- Логика объёма (volumeLength/Width/Height vs. totalVolume) --
    this.setupNumericVolumeRestrictions(); // Ограничения для объёмных полей
    this.setupVolumeModeListeners(); // Инициализация листенеров на weightVolumeChange и inputs
  }

  // --------------------------------------------------
  // ============= 1) Ограничение ввода ===============
  // --------------------------------------------------
  setupInputRestrictions() {
    const setupFieldRestriction = (field, regex, maxDecimals = null) => {
      if (!field) return;
      field.addEventListener("input", () => {
        // 1) Убираем все лишние символы, кроме цифр, точки, запятой
        field.value = field.value.replace(regex, "");
        // 2) Заменяем запятые на точки
        field.value = field.value.replace(/,/g, ".");
        // 3) Ограничиваем количество точек до 1
        const partsDot = field.value.split(".");
        if (partsDot.length > 2) {
          field.value = partsDot[0] + "." + partsDot.slice(1).join("");
        }
        // 4) Ограничиваем знаки после точки
        if (maxDecimals !== null && partsDot[1]?.length > maxDecimals) {
          field.value = `${partsDot[0]}.${partsDot[1].substring(
            0,
            maxDecimals
          )}`;
        }
      });
    };

    // Применяем к нужным полям
    setupFieldRestriction(this.fields.totalVolume, /[^0-9.,]/g, 4);
    setupFieldRestriction(this.fields.totalWeight, /[^0-9.,]/g, 2);
    setupFieldRestriction(this.fields.totalCost, /[^0-9.,]/g, 2);
    setupFieldRestriction(this.fields.quantity, /[^0-9]/g);
  }

  // --------------------------------------------------
  // =========== 2) Реалтайм-валидация ================
  // --------------------------------------------------
  setupRealtimeValidation() {
    const fieldNamesToWatch = [
      "totalVolume",
      "totalWeight",
      "totalCost",
      "quantity",
      "tnvedInput",
    ];
    fieldNamesToWatch.forEach((fieldName) => {
      const fieldEl = this.fields[fieldName];
      if (fieldEl) {
        fieldEl.addEventListener("input", () => {
          this.removeError(fieldEl);
          this.validateSingleField(fieldName);
        });
      }
    });

    // Радиокнопки category
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        this.clearCategoryError();
        this.validateCategory();
      });
    });

    const allFields = [
      this.fields.totalCost,
      this.fields.totalWeight,
      this.fields.totalVolume,
      this.fields.totalVolumeCalculated,
      this.fields.volumeLength,
      this.fields.volumeWidth,
      this.fields.volumeHeight,
      this.fields.quantity,
      this.fields.tnvedInput,
      this.fields.brand,
      this.fields.insurance,
      ...Array.from(this.fields.category),
      ...Array.from(this.fields.packingType),
    ];
    allFields.forEach((field) => {
      if (field) {
        field.addEventListener("input", () => {
          this.hideCalculationResult();
        });
      }
    });
  }

  // --------------------------------------------------
  // === 3) Сброс формы при переключении calc-type ====
  // --------------------------------------------------
  setupCalcTypeReset() {
    const calcTypeRadios = document.querySelectorAll('input[name="calc-type"]');
    calcTypeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        this.resetAll();
      });
    });
  }

  /**
   * resetAll(): вызывается только при переключении “calc-type”
   */
  resetAll() {
    // 1) Скрыть результат
    this.hideCalculationResult();
    // 2) Очистить ошибки
    this.clearErrors();
    // 3) Очистить нужные поля
    this.clearFields(this.fieldsToReset);
    // 4) Сбросить (опционально) State.clientData
    if (State.clientData) {
      State.clientData = {
        calcType: "",
        totalCost: "",
        currency: "",
        totalWeight: "",
        totalVolume: "",
        volumeLength: "",
        volumeWidth: "",
        volumeHeight: "",
        quantity: "",
        categoryKey: "",
        packingType: "",
        insurance: "",
        brand: "",
        tnvedInput: "",
        tnvedSelectedName: null,
        tnvedSelectedCode: null,
        tnvedSelectedImp: null,
      };
    }

    console.log("Форма и State.clientData сброшены при переключении calc-type");
  }

  // --------------------------------------------------
  // =========== 4) Логика объёма / переключения ======
  // --------------------------------------------------
  /**
   * setupNumericVolumeRestrictions():
   *  - ограничиваем input для volumeLength / volumeWidth / volumeHeight
   */
  setupNumericVolumeRestrictions() {
    const numericFields = [
      this.fields.volumeLength,
      this.fields.volumeWidth,
      this.fields.volumeHeight,
    ];
    numericFields.forEach((field) => {
      if (!field) return;
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

  /**
   * setupVolumeModeListeners():
   *  - когда weightVolumeChange переключается
   *  - при вводе в volumeLength/Width/Height пересчитываем totalVolumeCalculated
   */
  setupVolumeModeListeners() {
    const { weightVolumeChange, volumeLength, volumeWidth, volumeHeight } =
      this.fields;

    // Слушатель для переключателя “Ввести объём напрямую”
    if (weightVolumeChange) {
      weightVolumeChange.addEventListener("change", () => {
        this.toggleVolumeMode(); // включает/выключает поля
        // Дополнительная логика очистки:
        if (weightVolumeChange.checked) {
          // Если включён режим “ввести объём напрямую”:
          this.clearErrors();
          this.clearFields([volumeLength, volumeWidth, volumeHeight]);
        } else {
          this.clearErrors();
          this.clearFields([this.fields.totalVolume]);
        }
      });
    }

    // Слушатели для volumeLength/Width/Height: по input => пересчитывать объём
    [volumeLength, volumeWidth, volumeHeight].forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => {
        this.calculateVolume(); // пересчитываем totalVolumeCalculated
      });
    });
  }

  /**
   * toggleVolumeMode(): активирует/деактивирует поля.
   */
  toggleVolumeMode() {
    const {
      weightVolumeChange,
      totalVolume,
      volumeLength,
      volumeWidth,
      volumeHeight,
      totalVolumeCalculated,
    } = this.fields;

    if (!weightVolumeChange) return;

    if (weightVolumeChange.checked) {
      // Включили «Ввести объём напрямую»
      if (totalVolume) totalVolume.disabled = false;
      if (volumeLength) volumeLength.disabled = true;
      if (volumeWidth) volumeWidth.disabled = true;
      if (volumeHeight) volumeHeight.disabled = true;
      if (totalVolumeCalculated) {
        totalVolumeCalculated.value = "";
        totalVolumeCalculated.disabled = true;
      }
    } else {
      // Включили «Вычислить из габаритов»
      if (totalVolume) totalVolume.disabled = true;
      if (volumeLength) volumeLength.disabled = false;
      if (volumeWidth) volumeWidth.disabled = false;
      if (volumeHeight) volumeHeight.disabled = false;
      if (totalVolumeCalculated) totalVolumeCalculated.disabled = false;
    }
  }

  /**
   * calculateVolume(): пересчитывает totalVolumeCalculated = (L*W*H)/1,000,000
   */
  calculateVolume() {
    const { volumeLength, volumeWidth, volumeHeight, totalVolumeCalculated } =
      this.fields;

    if (
      !volumeLength ||
      !volumeWidth ||
      !volumeHeight ||
      !totalVolumeCalculated
    ) {
      return;
    }
    const length = parseFloat(volumeLength.value) || 0;
    const width = parseFloat(volumeWidth.value) || 0;
    const height = parseFloat(volumeHeight.value) || 0;

    const calcVol = (length * width * height) / 1_000_000;
    totalVolumeCalculated.value = calcVol > 0 ? calcVol.toFixed(4) : "";
  }

  // --------------------------------------------------
  // =========== 5) Валидация одиночных полей =========
  // --------------------------------------------------
  validateSingleField(fieldName) {
    switch (fieldName) {
      case "totalVolume":
        if (this.fields.weightVolumeChange?.checked) {
          this.validateNumber("totalVolume", {
            required: true,
            maxDecimals: 4,
          });
        } else {
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
        this.validateNumber("totalCost", { required: true, maxDecimals: 2 });
        break;
      case "quantity":
        this.validateNumber("quantity", { required: true });
        break;
      case "tnvedInput": {
        const calcTypeRadio = document.querySelector(
          'input[name="calc-type"]:checked'
        );
        const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";
        if (calcType === "calc-customs") {
          this.validateTnvedInput();
        }
        break;
      }
      default:
        break;
    }
  }

  // --------------------------------------------------
  // =========== 6) Проверка TnvedInput ===============
  // --------------------------------------------------
  validateTnvedInput() {
    const field = this.fields.tnvedInput;
    const selectedItem = State.tnvedSelection?.selectedItem;

    // 1) Проверка: выбрал ли пользователь ТНВЭД из списка?
    if (!selectedItem) {
      this.addError(field, "Нужно выбрать ТНВЭД из списка");
      return false;
    }

    // 2) Проверка: успели ли подгрузиться данные в State.clientData?
    //    То есть tnvedSelectedImp (пошлина), tnvedSelectedName, tnvedSelectedCode и т.д.
    const cd = State.clientData || {};
    if (
      cd.tnvedSelectedName == null ||
      cd.tnvedSelectedCode == null ||
      cd.tnvedSelectedImp == null
    ) {
      // Если одно из этих полей всё ещё null => пошлина/данные не подгрузились
      this.addError(
        field,
        "Подождите, пока загрузится % пошлин и данные по ТНВЭД"
      );
      console.log(State.clientData);
      return false;
    }

    return true;
  }

  // --------------------------------------------------
  // =========== 7) Очистка ряда полей ================
  // --------------------------------------------------
  clearFields(fields) {
    fields.forEach((field) => {
      if (field) field.value = "";
    });
  }

  // --------------------------------------------------
  // =========== 8) Утилиты: validateNumber/radio/...
  // --------------------------------------------------
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
    const isChecked = Array.from(radios).some((r) => r.checked);
    if (!isChecked && radios[0]) {
      this.addError(radios[0], "Необходимо выбрать один из вариантов");
      return false;
    }
    return true;
  }

  validateDimensions() {
    const { volumeLength, volumeWidth, volumeHeight } = this.fields;
    let isValid = true;
    [volumeLength, volumeWidth, volumeHeight].forEach((f) => {
      if (!f) return;
      const val = parseFloat(f.value.trim());
      if (isNaN(val) || val <= 0) {
        this.addError(f, "Поля обязательны для заполнения");
        isValid = false;
      }
    });
    return isValid;
  }

  validateCategory() {
    const radios = document.querySelectorAll('input[name="category"]');
    const isChecked = Array.from(radios).some((r) => r.checked);

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

  // --------------------------------------------------
  // =========== 9) Методы для ошибок/очисток =========
  // --------------------------------------------------
  addError(field, message) {
    if (!field) return;
    const parent = field.closest(".form-group") || field.parentElement;
    const errorSpan = parent?.querySelector(".error-message");
    if (errorSpan) {
      errorSpan.textContent = message;
    }
    field.classList.add("error-input");
  }

  removeError(fieldEl) {
    if (!fieldEl) return;
    fieldEl.classList.remove("error-input");
    const parent = fieldEl.closest(".form-group") || fieldEl.parentElement;
    const errorSpan = parent?.querySelector(".error-message");
    if (errorSpan) {
      errorSpan.textContent = "";
    }
  }

  clearCategoryError() {
    const errorSpan = document.querySelector(".error-message-category");
    const errorBlock = document.querySelector(".js-error-category");
    if (errorSpan) errorSpan.textContent = "";
    if (errorBlock) errorBlock.classList.remove("active");
  }

  clearErrors() {
    this.errors = {};
    document
      .querySelectorAll(".error-input")
      .forEach((el) => el.classList.remove("error-input"));
    document
      .querySelectorAll(".error-message")
      .forEach((el) => (el.textContent = ""));
    this.clearCategoryError();
  }

  hideCalculationResult() {
    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) {
      resultBlock.classList.remove("active");
    }
    // При желании сбрасывайте что-то в State, напр.:
    // State.directionsData = {};
  }

  // --------------------------------------------------
  // =========== 10) Основной метод validateAll =======
  // --------------------------------------------------
  validateAll() {
    this.clearErrors();

    const calcTypeRadio = document.querySelector(
      'input[name="calc-type"]:checked'
    );
    const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";
    const { weightVolumeChange } = this.fields;

    const isValid = [
      weightVolumeChange?.checked
        ? this.validateNumber("totalVolume", { required: true, maxDecimals: 4 })
        : this.validateDimensions(),
      this.validateNumber("totalWeight", {
        required: true,
        min: 5,
        maxDecimals: 2,
      }),
      this.validateNumber("quantity", { required: true }),
      this.validateNumber("totalCost", { required: true, maxDecimals: 2 }),
      this.validateRadio("total_currency"),
      calcType === "calc-cargo" ? this.validateCategory() : true,
      this.validateRadio("packing-type"),
      calcType === "calc-customs" ? this.validateTnvedInput() : true,
    ].every(Boolean);

    if (isValid) {
      this.saveToState();
    }
    return isValid;
  }

  // --------------------------------------------------
  // =========== 11) Сохранение в State.clientData =====
  // --------------------------------------------------
  saveToState() {
    // Определяем calcType
    const calcType =
      document.querySelector('input[name="calc-type"]:checked')?.value ||
      "calc-cargo";

    // Находим выбранную категорию
    const categoryEl = Array.from(this.fields.category).find((r) => r.checked);

    // Находим выбранную упаковку
    const packingTypeEl = Array.from(this.fields.packingType).find(
      (r) => r.checked
    );

    // Если weightVolumeChange.checked => totalVolume берём из this.fields.totalVolume
    // Иначе => из this.fields.totalVolumeCalculated
    let finalVolume = 0;
    if (this.fields.weightVolumeChange?.checked) {
      finalVolume = parseFloat(this.fields.totalVolume.value) || 0;
    } else {
      finalVolume = parseFloat(this.fields.totalVolumeCalculated.value) || 0;
    }

    // Обновляем State.clientData
    State.clientData.calcType = calcType;

    State.clientData.totalCost = parseFloat(this.fields.totalCost.value) || 0;
    State.clientData.currency =
      document.querySelector('input[name="total_currency"]:checked')?.value ||
      "dollar";

    State.clientData.totalWeight =
      parseFloat(this.fields.totalWeight.value) || 0;
    State.clientData.totalVolume = finalVolume; // Обновляем объём

    State.clientData.volumeLength =
      parseFloat(this.fields.volumeLength.value) || 0;
    State.clientData.volumeWidth =
      parseFloat(this.fields.volumeWidth.value) || 0;
    State.clientData.volumeHeight =
      parseFloat(this.fields.volumeHeight.value) || 0;

    State.clientData.quantity = parseInt(this.fields.quantity.value, 10) || 0;

    // Категория (если выбрана)
    State.clientData.categoryKey = categoryEl ? categoryEl.value : null;

    // Упаковка
    State.clientData.packingType = packingTypeEl ? packingTypeEl.value : null;

    // Флажки
    State.clientData.insurance = !!this.fields.insurance?.checked;
    State.clientData.brand = !!this.fields.brand?.checked;

    // ТНВЭД ввод пользователя (или State.tnvedSelection.selectedItem)
    State.clientData.tnvedInput = this.fields.tnvedInput.value.trim();
  }
}
