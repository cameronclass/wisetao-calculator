// FormValidation.js
import Address from "../api/Address.js";
import { State } from "../data/State.js";
import InputRestrictions from "./inputRestrictions.js";
import RealtimeValidation from "./realtimeValidation.js";
import VolumeManager from "./volumeManager.js";
import StateManager from "./stateManager.js";
import AddressManager from "./addressManager.js";
import NdsManager from "./ndsManager.js";
import ValidationMethods from "./validationMethods.js";
import ErrorManager from "./errorManager.js";

export class FormValidation {
  constructor(fields) {
    this.fields = fields;
    this.errors = {};

    // Добавляем новые поля в список для сброса (nds добавлено)
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
      this.fields.nds, // новое поле
      this.fields.custom_nds, // новое поле
    ];

    // Инициализируем состояние адреса и NDS
    StateManager.updateState("addressError", null);
    // По умолчанию NDS = 20% (0.2)
    StateManager.updateState("nds", 0.2);

    this.addressHandler = new Address('input[name="address"]');

    // Настройка ограничений ввода
    InputRestrictions.setupInputRestrictions(this.fields);
    InputRestrictions.setupNumericVolumeRestrictions(this.fields);

    // Реалтайм-валидация остальных полей
    RealtimeValidation.setupRealtimeValidation(this.fields, this);

    // Слушатели переключения calc-type и delivery-option
    this.setupCalcTypeReset();

    // Габарит/объём
    VolumeManager.setupVolumeModeListeners(this.fields, this);

    // Слушатель глобальных изменений в State
    StateManager.setupStateEventListener(this);

    // Слушатель для адреса
    AddressManager.setupAddressCheckboxListener(this.fields, this);

    // Слушатели для полей NDS и чекбокса custom_nds
    NdsManager.setupNdsListeners(this.fields, this);

    this.setupQuantityCheckboxListener();
    this.updateCalculatedData();
  }

  setupQuantityCheckboxListener() {
    if (this.fields.quantity_checkbox) {
      this.fields.quantity_checkbox.addEventListener("change", (e) => {
        this.updateCalculatedData();
        this.updateState("clientData", {
          ...State.clientData,
          quantityCheck: e.target.checked,
        });
      });
    }
  }

  updateCalculatedData() {
    // Проверяем, установлен ли чекбокс quantity_checkbox
    const isChecked = this.fields.quantity_checkbox?.checked;

    // Если чекбокс не установлен, убираем класс active и выходим
    if (!isChecked) {
      const calculatedDataElements =
        document.querySelectorAll(".calculated-data");
      calculatedDataElements.forEach((element) => {
        element.classList.remove("active");
      });
      return;
    }

    // Определяем, использовать ли поле totalVolume или totalVolumeCalculated
    const weightVolumeChecked = this.fields.weightVolumeChange?.checked;
    const volumeField = weightVolumeChecked
      ? this.fields.totalVolume
      : this.fields.totalVolumeCalculated;
    const weightField = this.fields.totalWeight;

    // Получаем значения полей
    const volumeValue = volumeField?.value || "";
    const weightValue = weightField?.value || "";

    // Проверяем, не пустые ли значения
    if (volumeValue.trim() === "" || weightValue.trim() === "") {
      const calculatedDataElements =
        document.querySelectorAll(".calculated-data");
      calculatedDataElements.forEach((element) => {
        element.classList.remove("active");
      });
      return;
    }

    // Проверяем валидность полей
    const volumeValidation = ValidationMethods.validateNumber(
      this.fields,
      weightVolumeChecked ? "totalVolume" : "totalVolumeCalculated",
      { required: true, maxDecimals: 4 },
      this
    );

    const weightValidation = ValidationMethods.validateNumber(
      this.fields,
      "totalWeight",
      { required: true, min: 5, maxDecimals: 2 },
      this
    );

    // Если любое из полей не прошло валидацию, убираем класс active
    if (!volumeValidation || !weightValidation) {
      const calculatedDataElements =
        document.querySelectorAll(".calculated-data");
      calculatedDataElements.forEach((element) => {
        element.classList.remove("active");
      });
      return;
    }

    // Если все условия выполнены, добавляем класс active
    const calculatedDataElements =
      document.querySelectorAll(".calculated-data");
    calculatedDataElements.forEach((element) => {
      element.classList.add("active");
    });

    // Выполняем расчёты объёма и веса
    const quantity = parseInt(this.fields.quantity.value, 10) || 1;

    // Обработка объема
    const calculatedVolume = parseFloat(volumeField.value) * quantity;
    const volumeTarget = weightVolumeChecked
      ? this.fields.totalVolume
          .closest(".group-input__input")
          .querySelector(".calculated-data")
      : document.querySelector(".volume>.calculated-data");

    if (volumeTarget) {
      volumeTarget.textContent = `Итого: ${calculatedVolume.toFixed(4)} м³`;
    }

    // Обработка веса
    if (weightField) {
      const calculatedWeight = (parseFloat(weightField.value) || 0) * quantity;
      const weightTarget = weightField
        .closest(".group-input__input")
        .querySelector(".calculated-data");

      if (weightTarget) {
        weightTarget.textContent = `Итого: ${calculatedWeight.toFixed(2)} кг`;
      }
    }
  }

  updateState(prop, value) {
    StateManager.updateState(prop, value);
  }

  setupCalcTypeReset() {
    const calcTypeRadios = document.querySelectorAll('input[name="calc-type"]');
    const deliveryOptionRadios = document.querySelectorAll(
      'input[name="delivery-option"]'
    );
    calcTypeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
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
    // (1) Скрываем результат расчёта
    this.hideCalculationResult();

    // (2) Очищаем ошибки
    this.clearErrors();

    // (3) Очищаем нужные поля
    this.clearFields(this.fieldsToReset);

    // (4) Сбрасываем данные в State.clientData
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

    // Сброс адреса
    this.updateState("address", null);
    this.updateState("addressError", null);

    if (this.fields.address) {
      this.fields.address.value = "";
    }

    // === NEW: Сброс полей NDS ===
    if (this.fields.custom_nds) {
      this.fields.custom_nds.checked = false;
    }
    if (this.fields.nds) {
      this.fields.nds.disabled = true;
      this.fields.nds.value = "20";
      this.updateState("nds", 0.2);
    }

    const tnvedBlock = document.querySelector(".white-cargo__justinfo");
    if (tnvedBlock) {
      tnvedBlock.classList.remove("active");
    }

    console.log("Форма и State.clientData сброшены при переключении calc-type");
  }

  validateAll() {
    this.clearErrors();

    const calcTypeRadio = document.querySelector(
      'input[name="calc-type"]:checked'
    );
    const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";
    const { weightVolumeChange } = this.fields;

    const validations = [];

    if (weightVolumeChange?.checked) {
      validations.push(
        ValidationMethods.validateNumber(
          this.fields,
          "totalVolume",
          { required: true, maxDecimals: 4, maxValue: 10000 },
          this
        )
      );
    } else {
      validations.push(ValidationMethods.validateDimensions(this.fields, this));
    }

    validations.push(
      ValidationMethods.validateNumber(
        this.fields,
        "totalWeight",
        { required: true, min: 5, maxDecimals: 2, maxValue: 10000 },
        this
      )
    );

    // Добавляем новую проверку
    validations.push(this.validateWeightToVolumeRatio());

    validations.push(
      ValidationMethods.validateNumber(
        this.fields,
        "quantity",
        { required: true },
        this
      )
    );
    validations.push(
      ValidationMethods.validateNumber(
        this.fields,
        "totalCost",
        { required: true, maxDecimals: 2 },
        this
      )
    );
    validations.push(ValidationMethods.validateRadio("total_currency", this));

    validations.push(
      calcType === "calc-cargo"
        ? ValidationMethods.validateCategory(this)
        : true
    );

    validations.push(
      calcType === "calc-customs"
        ? ValidationMethods.validateTnvedInput(this.fields, this)
        : true
    );

    validations.push(ValidationMethods.validateAddress(this.fields, this));
    validations.push(
      ValidationMethods.validateDeliveryOption(this.fields, this)
    );

    // Если всё прошло успешно – сохраняем данные в State
    const isValid = validations.every(Boolean);
    if (isValid) {
      this.saveToState();
    }
    return isValid;
  }

  validateWeightToVolumeRatio() {
    // Определяем, использовать ли поле totalVolume или totalVolumeCalculated
    const weightVolumeChecked = this.fields.weightVolumeChange?.checked;
    const volumeField = weightVolumeChecked
      ? this.fields.totalVolume
      : this.fields.totalVolumeCalculated;
    const weightField = this.fields.totalWeight;

    if (!volumeField || !weightField) return true;

    const volumeValue = volumeField.value.trim();
    const weightValue = weightField.value.trim();

    if (volumeValue === "" || weightValue === "") return true;

    const weight = parseFloat(weightValue);
    const volume = parseFloat(volumeValue);

    if (isNaN(weight) || isNaN(volume)) return true;

    if (volume === 0) {
      this.addError(weightField, "Объём не соответствует весу");
      this.addError(volumeField, "Объём не соответствует весу");
      return false;
    }

    const ratio = weight / volume;

    if (ratio > 10000) {
      this.addError(weightField, "Объём не соответствует весу");
      this.addError(volumeField, "Объём не соответствует весу");
      return false;
    }

    this.removeError(weightField);
    this.removeError(volumeField);
    return true;
  }

  validateSingleField(fieldName) {
    switch (fieldName) {
      case "totalVolume":
        if (this.fields.weightVolumeChange?.checked) {
          ValidationMethods.validateNumber(
            this.fields,
            "totalVolume",
            { required: true, maxDecimals: 4, maxValue: 10000 },
            this
          );
        } else {
          ValidationMethods.validateDimensions(this.fields, this);
        }
        break;
      case "totalWeight":
        ValidationMethods.validateNumber(
          this.fields,
          "totalWeight",
          { required: true, min: 5, maxDecimals: 2, maxValue: 10000 },
          this
        );
        break;
      case "totalCost":
        ValidationMethods.validateNumber(
          this.fields,
          "totalCost",
          { required: true, maxDecimals: 2 },
          this
        );
        break;
      case "quantity":
        ValidationMethods.validateNumber(
          this.fields,
          "quantity",
          { required: true },
          this
        );
        break;
      case "tnvedInput": {
        const calcTypeRadio = document.querySelector(
          'input[name="calc-type"]:checked'
        );
        const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";
        if (calcType === "calc-customs") {
          ValidationMethods.validateTnvedInput(this.fields, this);
        }
        break;
      }
      default:
        break;
    }
  }

  saveToState() {
    const calcType =
      document.querySelector('input[name="calc-type"]:checked')?.value ||
      "calc-cargo";
    const categoryEl = Array.from(this.fields.category).find((r) => r.checked);
    const packingTypeEl = Array.from(this.fields.packingType).find(
      (r) => r.checked
    );

    // Определяем, использовать ли поле totalVolume или totalVolumeCalculated
    const weightVolumeChecked = this.fields.weightVolumeChange?.checked;
    const volumeField = weightVolumeChecked
      ? this.fields.totalVolume
      : this.fields.totalVolumeCalculated;
    const weightField = this.fields.totalWeight;

    // Получаем значения полей
    const volumeValue = volumeField?.value || "";
    const weightValue = weightField?.value || "";

    // Проверяем, не пустые ли значения
    if (volumeValue.trim() === "" || weightValue.trim() === "") {
      return;
    }

    // Проверяем валидность полей
    const volumeValidation = ValidationMethods.validateNumber(
      this.fields,
      weightVolumeChecked ? "totalVolume" : "totalVolumeCalculated",
      { required: true, maxDecimals: 4 },
      this
    );

    const weightValidation = ValidationMethods.validateNumber(
      this.fields,
      "totalWeight",
      { required: true, min: 5, maxDecimals: 2 },
      this
    );

    // Если любое из полей не прошло валидацию, выходим
    if (!volumeValidation || !weightValidation) {
      return;
    }

    // Проверяем, установлен ли чекбокс quantity_checkbox
    const useQuantity = this.fields.quantity_checkbox?.checked;

    // Выполняем расчёты объёма и веса, если чекбокс активен
    let calculatedVolume, calculatedWeight;
    if (useQuantity) {
      const quantity = parseInt(this.fields.quantity.value, 10) || 1;

      // Обработка объема
      calculatedVolume = parseFloat(volumeField.value) * quantity;

      // Обработка веса
      calculatedWeight = (parseFloat(weightField.value) || 0) * quantity;
    } else {
      // Сохраняем原始ные значения
      calculatedVolume = parseFloat(volumeField.value) || 0;
      calculatedWeight = parseFloat(weightField.value) || 0;
    }

    State.clientData.calcType = calcType;
    State.clientData.totalCost = parseFloat(this.fields.totalCost.value) || 0;
    State.clientData.currency =
      document.querySelector('input[name="total_currency"]:checked')?.value ||
      "dollar";
    State.clientData.totalWeight = calculatedWeight;
    State.clientData.totalVolume = calculatedVolume;
    State.clientData.volumeLength =
      parseFloat(this.fields.volumeLength.value) || 0;
    State.clientData.volumeWidth =
      parseFloat(this.fields.volumeWidth.value) || 0;
    State.clientData.volumeHeight =
      parseFloat(this.fields.volumeHeight.value) || 0;
    State.clientData.quantity = parseInt(this.fields.quantity.value, 10) || 0;
    State.clientData.quantityCheck = !!this.fields.quantity_checkbox?.checked;
    State.clientData.categoryKey = categoryEl ? categoryEl.value : null;
    State.clientData.packingType = packingTypeEl ? packingTypeEl.value : null;
    State.clientData.insurance = !!this.fields.insurance?.checked;
    State.clientData.brand = !!this.fields.brand?.checked;
    State.clientData.tnvedInput = this.fields.tnvedInput.value.trim();

    const deliveryOptionRadio = document.querySelector(
      'input[name="delivery-option"]:checked'
    );
    State.clientData.deliveryOption = deliveryOptionRadio
      ? deliveryOptionRadio.value
      : null;

    if (State.address) {
      State.clientData.address = { ...State.address };
    } else {
      State.clientData.address = null;
    }

    // Если чекбокс custom_nds выбран – берём значение из поля, иначе по умолчанию 20%
    if (this.fields.custom_nds && this.fields.custom_nds.checked) {
      const ndsValue = parseFloat(this.fields.nds.value) || 0;
      State.nds = ndsValue / 100;
    } else {
      State.nds = 0.2;
    }
  }

  clearFields(fieldsArray) {
    fieldsArray.forEach((field) => {
      if (field) field.value = "";
    });
  }

  addError(field, message) {
    ErrorManager.addError(field, message);
  }

  removeError(field) {
    ErrorManager.removeError(field);
  }

  clearErrors() {
    ErrorManager.clearErrors();
  }

  clearCategoryError() {
    ErrorManager.clearCategoryError();
  }

  hideCalculationResult() {
    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) {
      resultBlock.classList.remove("active");
    }
  }
}

export default FormValidation;
