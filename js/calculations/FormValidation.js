// FormValidation.js
import Address from "../api/Address.js";
import { State } from "../data/State.js";

export class FormValidation {
  constructor(fields) {
    this.fields = fields;
    this.errors = {};

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
      this.fields.address,
    ];

    this.updateState("addressError", null);

    this.addressHandler = new Address('input[name="address"]');

    this.setupInputRestrictions();

    this.setupRealtimeValidation();

    this.setupCalcTypeReset();

    // (4) Габариты/объёмная логика
    this.setupNumericVolumeRestrictions();
    this.setupVolumeModeListeners();

    // (5) Слушатель для глобальных изменений в State
    this.setupStateEventListener();

    this.setupAddressCheckboxListener();
  }

  updateState(prop, value) {
    State[prop] = value;
    const event = new CustomEvent("stateChange", {
      detail: { prop, value },
    });
    document.dispatchEvent(event);
  }

  setupStateEventListener() {
    document.addEventListener("stateChange", this.handleStateChange.bind(this));
  }

  handleStateChange(event) {
    const { prop, value } = event.detail;
    this.handleAddressStateChange(prop, value);
  }

  handleAddressStateChange(prop, value) {
    if (prop === "address") {
      if (value) {
        this.removeError(this.fields.address);
      } else if (State.addressError) {
        this.addError(this.fields.address, State.addressError);
      }

      this.hideCalculationResult();
    }

    if (prop === "addressError") {
      if (value) {
        this.addError(this.fields.address, value);
      } else {
        this.removeError(this.fields.address);
      }

      this.hideCalculationResult();
    }
  }

  setupInputRestrictions() {
    /**
     * Ограничивает ввод на уровне события input,
     * убирая любые нежелательные символы.
     *
     * @param {HTMLInputElement} field - поле ввода
     * @param {RegExp} regex - регулярка, соответствующая символам, которые нужно удалить
     * @param {number|null} maxDecimals - ограничение знаков после точки (null если не нужно)
     */
    const setupFieldRestriction = (field, regex, maxDecimals = null) => {
      if (!field) return;
      field.addEventListener("input", () => {
        // (1) Убираем все лишние символы, кроме цифр, точки, запятой
        field.value = field.value.replace(regex, "");
        // (2) Заменяем запятые на точки
        field.value = field.value.replace(/,/g, ".");
        // (3) Ограничиваем количество точек до 1
        const partsDot = field.value.split(".");
        if (partsDot.length > 2) {
          field.value = partsDot[0] + "." + partsDot.slice(1).join("");
        }
        // (4) Ограничиваем знаки после точки
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

  setupRealtimeValidation() {
    const fieldNamesToWatch = [
      "totalVolume",
      "totalWeight",
      "totalCost",
      "quantity",
      "tnvedInput",
    ];

    // 1) Подписка на input для удаления ошибок и повторной валидации
    fieldNamesToWatch.forEach((fieldName) => {
      const fieldEl = this.fields[fieldName];
      if (fieldEl) {
        fieldEl.addEventListener("input", () => {
          this.removeError(fieldEl);
          this.validateSingleField(fieldName);
          this.hideCalculationResult();
        });
      }
    });

    // 2) Подписка на изменение radiobutton "category"
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        this.clearCategoryError();
        this.validateCategory();
        this.hideCalculationResult();
      });
    });

    // 3) Дополнительно, любое изменение поля скрывает результат расчёта
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

    // === NEW: Добавляем realtime-валидацию для client-name и client-phone ===
    const nameField = document.querySelector('input[name="client-name"]');
    const phoneField = document.querySelector('input[name="client-phone"]');

    [nameField, phoneField].forEach((field) => {
      if (field) {
        field.addEventListener("input", () => {
          // Удаляем ошибку при вводе, если была
          this.removeError(field);

          // Скрываем результат расчёта (как и при вводе других полей)
          this.hideCalculationResult();
        });
      }
    });

    // (2) NEW: добавляем реалтайм-валидацию для redeem-полей
    const redeemFieldNames = [
      "data-name",
      "data_cost",
      "data-quantity",
      "data-color",
      "data-url",
      "data-size",
    ];

    redeemFieldNames.forEach((fieldName) => {
      // Найти все инпуты с этим именем (на случай, если у вас их несколько)
      document
        .querySelectorAll(`input[name="${fieldName}"]`)
        .forEach((field) => {
          field.addEventListener("input", () => {
            // Убрать ошибку, если она была
            this.removeError(field);

            // Скрыть результат расчёта (как и для других полей)
            this.hideCalculationResult();
          });
        });
    });
  }

  setupCalcTypeReset() {
    const calcTypeRadios = document.querySelectorAll('input[name="calc-type"]');
    const deliveryOptionRadios = document.querySelectorAll(
      'input[name="delivery-option"]'
    );
    calcTypeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        /* this.resetAll(); */
        this.hideCalculationResult();
      });
    });
    deliveryOptionRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        this.hideCalculationResult();
      });
    });
  }

  resetAll() {
    // (1) Скрыть результат
    this.hideCalculationResult();

    // (2) Очистить ошибки
    this.clearErrors();

    // (3) Очистить нужные поля
    this.clearFields(this.fieldsToReset);

    // (4) Сбросить (опционально) State.clientData
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
        address: null,
        deliveryOption: null,
      };
    }

    // Сброс состояния адреса
    this.updateState("address", null);
    this.updateState("addressError", null);

    // Очистка поля адреса в форме
    if (this.fields.address) {
      this.fields.address.value = "";
    }

    // Сбрасываем блок ТНВЭД (белый прямоугольник) если он был активен
    const tnvedBlock = document.querySelector(".white-cargo__justinfo");
    if (tnvedBlock) {
      tnvedBlock.classList.remove("active");
    }

    console.log("Форма и State.clientData сброшены при переключении calc-type");
  }

  setupVolumeModeListeners() {
    const { weightVolumeChange, volumeLength, volumeWidth, volumeHeight } =
      this.fields;

    // (1) При переключении “Ввести объём напрямую”
    if (weightVolumeChange) {
      weightVolumeChange.addEventListener("change", () => {
        this.toggleVolumeMode();
        // Доп. логика очистки
        if (weightVolumeChange.checked) {
          this.clearErrors();
          this.clearFields([volumeLength, volumeWidth, volumeHeight]);
        } else {
          this.clearErrors();
          this.clearFields([this.fields.totalVolume]);
        }
        this.hideCalculationResult();
      });
    }

    // (2) При изменении длины/ширины/высоты пересчитывать объём
    [volumeLength, volumeWidth, volumeHeight].forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => {
        this.calculateVolume();
        this.hideCalculationResult();
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

    if (!weightVolumeChange) return;

    if (weightVolumeChange.checked) {
      // Режим "Ввести объём напрямую"
      if (totalVolume) totalVolume.disabled = false;
      if (volumeLength) volumeLength.disabled = true;
      if (volumeWidth) volumeWidth.disabled = true;
      if (volumeHeight) volumeHeight.disabled = true;
      if (totalVolumeCalculated) {
        totalVolumeCalculated.value = "";
        totalVolumeCalculated.disabled = true;
      }
    } else {
      // Режим "Вычислить из габаритов"
      if (totalVolume) totalVolume.disabled = true;
      if (volumeLength) volumeLength.disabled = false;
      if (volumeWidth) volumeWidth.disabled = false;
      if (volumeHeight) volumeHeight.disabled = false;
      if (totalVolumeCalculated) {
        totalVolumeCalculated.disabled = false;
      }
    }
  }

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

  validateAll() {
    this.clearErrors();

    const calcTypeRadio = document.querySelector(
      'input[name="calc-type"]:checked'
    );
    const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";
    const { weightVolumeChange } = this.fields;

    // Составляем массив проверок
    const isValid = [
      // Если включён ввод объёма вручную:
      weightVolumeChange?.checked
        ? this.validateNumber("totalVolume", { required: true, maxDecimals: 4 })
        : this.validateDimensions(), // иначе проверяем габариты

      this.validateNumber("totalWeight", {
        required: true,
        min: 5,
        maxDecimals: 2,
      }),
      this.validateNumber("quantity", { required: true }),
      this.validateNumber("totalCost", { required: true, maxDecimals: 2 }),
      this.validateRadio("total_currency"),

      // Для calc-cargo требуется категория
      calcType === "calc-cargo" ? this.validateCategory() : true,

      // Упаковка (радел "packing-type")
      /* this.validateRadio("packing-type"), */

      // Для calc-customs требуется TНВЭД
      calcType === "calc-customs" ? this.validateTnvedInput() : true,

      // Проверяем адрес (если чекбокс включён)
      this.validateAddress(),
      this.validateDeliveryOption(),
    ].every(Boolean);

    // Если всё ок, сохраняем в State
    if (isValid) {
      this.saveToState();
    }

    return isValid;
  }

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

  validateDeliveryOption() {
    const radio = document.querySelector(
      'input[name="delivery-option"]:checked'
    );
    if (!radio) {
      const firstRadio = document.querySelector(
        'input[name="delivery-option"]'
      );
      if (firstRadio) {
        this.addError(firstRadio, "Пожалуйста, выберите способ доставки");
      }
      return false;
    }
    if (radio.value === "delivery-and-pickup") {
      const isRedeemValid = this.validateRedeemItems();
      const isClientValid = this.validateClientFields();

      return isRedeemValid && isClientValid;
    }
    return true; // Если "delivery-only", ничего не требуем
  }

  validateRedeemItems() {
    let isValid = true;

    // Сопоставляем ключ в state => имя инпута
    const requiredFieldsMap = {
      name: "data-name",
      cost: "data_cost",
      quantity: "data-quantity",
      color: "data-color",
      url: "data-url",
      size: "data-size",
    };

    const keys = Object.keys(State.redeemData || {});
    keys.forEach((index) => {
      const item = State.redeemData[index];
      if (!item) return;

      // Ищем контейнер с data-redeem="N"
      const container = document.querySelector(`[data-redeem="${index}"]`);
      if (!container) return;

      // Для каждого обязательного поля проверяем заполнение
      for (const [propName, inputName] of Object.entries(requiredFieldsMap)) {
        const value = item[propName]?.toString().trim() || "";
        const inputEl = container.querySelector(`[name="${inputName}"]`);

        if (!inputEl) continue; // на всякий случай если разметка другая

        if (!value) {
          this.addError(inputEl, "Заполните поле");
          isValid = false;
        } else {
          // Если заполнено — убираем ошибку, если вдруг была
          this.removeError(inputEl);
        }
      }
    });

    return isValid;
  }

  validateClientFields() {
    let isValid = true;

    const nameEl = document.querySelector('input[name="client-name"]');
    const phoneEl = document.querySelector('input[name="client-phone"]');

    // Проверяем поле "Ваше имя"
    if (nameEl && !nameEl.value.trim()) {
      this.addError(nameEl, "Заполните поле");
      isValid = false;
    } else if (nameEl) {
      this.removeError(nameEl);
    }

    // Проверяем поле "Контактный телефон"
    if (phoneEl && !phoneEl.value.trim()) {
      this.addError(phoneEl, "Заполните поле");
      isValid = false;
    } else if (phoneEl) {
      this.removeError(phoneEl);
    }

    return isValid;
  }

  validateNumber(fieldName, options = {}) {
    const field = this.fields[fieldName];
    if (!field) return true;

    const value = field.value.trim();
    const { required = false, min = null, maxDecimals = 2 } = options;

    // 1) required
    if (required && value === "") {
      this.addError(field, "Заполните поле");
      return false;
    }

    // 2) Проверка формата (число с ограничением знаков после точки)
    const regex = new RegExp(`^\\d+(\\.\\d{0,${maxDecimals}})?$`);
    if (value && !regex.test(value)) {
      this.addError(
        field,
        `Введите число с не более ${maxDecimals} знаками после точки`
      );
      return false;
    }

    // 3) min-ограничение
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && min !== null && numericValue < min) {
      this.addError(field, `Значение должно быть не менее ${min}`);
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
      if (errorSpan) {
        errorSpan.textContent = "Необходимо выбрать категорию";
        errorSpan.style.display = "block";
      }
      if (errorBlock) errorBlock.classList.add("active");
      return false;
    }

    if (errorSpan) {
      errorSpan.textContent = "";
      errorSpan.style.display = "none";
    }
    if (errorBlock) {
      errorBlock.classList.remove("active");
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

  validateTnvedInput() {
    const field = this.fields.tnvedInput;
    const selectedItem = State.tnvedSelection?.selectedItem;

    // (1) Проверка: выбрал ли пользователь ТНВЭД из списка?
    if (!selectedItem) {
      this.addError(field, "Нужно выбрать ТНВЭД из списка");
      return false;
    }

    // (2) Проверка загрузки пошлины/данных по ТНВЭД
    const cd = State.clientData || {};
    if (
      cd.tnvedSelectedName == null ||
      cd.tnvedSelectedCode == null ||
      cd.tnvedSelectedImp == null
    ) {
      this.addError(
        field,
        "Подождите, пока загрузится % пошлин и данные по ТНВЭД"
      );
      console.log(State.clientData);
      return false;
    }

    return true;
  }

  validateAddress() {
    const addressField = this.fields.address;
    const addressError = State.addressError;

    // Если чекбокс включён, а адрес не выбран
    if (this.fields.addressCheck?.checked && !State.address) {
      this.addError(
        addressField,
        addressError || "Пожалуйста, выберите адрес."
      );
      return false;
    }

    // Если есть ошибка в State.addressError
    if (addressError) {
      this.addError(addressField, addressError);
      return false;
    }

    // Убираем ошибку, если всё хорошо
    this.removeError(addressField);
    return true;
  }

  saveToState() {
    const calcType =
      document.querySelector('input[name="calc-type"]:checked')?.value ||
      "calc-cargo";

    const categoryEl = Array.from(this.fields.category).find((r) => r.checked);
    const packingTypeEl = Array.from(this.fields.packingType).find(
      (r) => r.checked
    );

    // Если режим "ввести объём напрямую" => totalVolume берём из поля totalVolume
    // Иначе => из totalVolumeCalculated
    let finalVolume = 0;
    if (this.fields.weightVolumeChange?.checked) {
      finalVolume = parseFloat(this.fields.totalVolume.value) || 0;
    } else {
      finalVolume = parseFloat(this.fields.totalVolumeCalculated.value) || 0;
    }

    // Заполняем State.clientData
    State.clientData.calcType = calcType;

    State.clientData.totalCost = parseFloat(this.fields.totalCost.value) || 0;
    State.clientData.currency =
      document.querySelector('input[name="total_currency"]:checked')?.value ||
      "dollar";

    State.clientData.totalWeight =
      parseFloat(this.fields.totalWeight.value) || 0;
    State.clientData.totalVolume = finalVolume;

    State.clientData.volumeLength =
      parseFloat(this.fields.volumeLength.value) || 0;
    State.clientData.volumeWidth =
      parseFloat(this.fields.volumeWidth.value) || 0;
    State.clientData.volumeHeight =
      parseFloat(this.fields.volumeHeight.value) || 0;

    State.clientData.quantity = parseInt(this.fields.quantity.value, 10) || 0;

    // Категория
    State.clientData.categoryKey = categoryEl ? categoryEl.value : null;

    // Упаковка
    State.clientData.packingType = packingTypeEl ? packingTypeEl.value : null;

    // Флажки
    State.clientData.insurance = !!this.fields.insurance?.checked;
    State.clientData.brand = !!this.fields.brand?.checked;

    // ТНВЭД
    State.clientData.tnvedInput = this.fields.tnvedInput.value.trim();

    // NEW: считываем radio delivery-option -> в State
    const deliveryOptionRadio = document.querySelector(
      'input[name="delivery-option"]:checked'
    );
    State.clientData.deliveryOption = deliveryOptionRadio
      ? deliveryOptionRadio.value
      : null;

    // Адрес (если пользователь выбрал)
    if (State.address) {
      State.clientData.address = { ...State.address };
    } else {
      State.clientData.address = null;
    }

    /* console.log("State.clientData обновлён:", State.clientData); */
  }

  setupAddressCheckboxListener() {
    const addressCheckbox = this.fields.addressCheck;
    if (!addressCheckbox) {
      console.warn(
        "Чекбокс адреса с селектором 'input[name=\"address_checkbox\"]' не найден."
      );
      return;
    }

    // Изначальное состояние при загрузке
    this.toggleToAddressElements(State.clientData.addressCheck);
    this.handleAddressCheckboxChange(State.clientData.addressCheck);

    // Слушатель на изменение
    addressCheckbox.addEventListener("change", (event) => {
      const isChecked = event.target.checked;
      this.toggleToAddressElements(isChecked);
      this.handleAddressCheckboxChange(isChecked);
      this.hideCalculationResult();

      // Дополнительная проверка/установка ошибок
      if (isChecked && !State.address) {
        this.updateState(
          "addressError",
          "Пожалуйста, выберите адрес из списка."
        );
      } else if (!isChecked) {
        this.updateState("addressError", null);
      }
    });
  }

  toggleToAddressElements(isVisible) {
    const toAddressElements = document.querySelectorAll(".to-address");
    toAddressElements.forEach((element) => {
      if (isVisible) {
        element.classList.remove("hidden");
      } else {
        element.classList.add("hidden");
      }
    });
  }

  handleAddressCheckboxChange(isChecked) {
    if (!isChecked && State.address) {
      // Если чекбокс отключен, но адрес уже был выбран, сбрасываем
      this.fields.address.value = "";
      this.updateState("address", null);
      this.updateState("addressError", null);
      this.removeError(this.fields.address);
    }
  }

  clearFields(fields) {
    fields.forEach((field) => {
      if (field) field.value = "";
    });
  }

  addError(field, message) {
    if (!field) return;
    const parent = field.closest(".form-group") || field.parentElement;
    const errorSpan = parent?.querySelector(".error-message");
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.style.display = "block";
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
      errorSpan.style.display = "none";
    }
  }

  clearCategoryError() {
    const errorSpan = document.querySelector(".error-message-category");
    const errorBlock = document.querySelector(".js-error-category");
    if (errorSpan) {
      errorSpan.textContent = "";
      errorSpan.style.display = "none";
    }
    if (errorBlock) {
      errorBlock.classList.remove("active");
    }
  }

  clearErrors() {
    this.errors = {};
    document
      .querySelectorAll(".error-input")
      .forEach((el) => el.classList.remove("error-input"));

    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
      el.style.display = "none";
    });

    this.clearCategoryError();
  }

  hideCalculationResult() {
    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) {
      resultBlock.classList.remove("active");
    }
    // При желании можно сбрасывать что-то в State, напр.:
    // State.directionsData = {};
  }
}

export default FormValidation;
