// FormValidation.js
import Address from "../api/Address.js";
import { State } from "../data/State.js";
import InputRestrictions from "./inputRestrictions.js";
import RealtimeValidation from "./realtimeValidation.js";
import VolumeManager from "./volumeManager.js";
import StateManager from "./stateManager.js";
import AddressManager from "./addressManager.js";
import ValidationMethods from "./validationMethods.js";
import ErrorManager from "./errorManager.js";

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

    // Инициализируем состояние адреса
    StateManager.updateState("addressError", null);

    this.addressHandler = new Address('input[name="address"]');

    // Настраиваем ограничение ввода
    InputRestrictions.setupInputRestrictions(this.fields);
    InputRestrictions.setupNumericVolumeRestrictions(this.fields);

    // Настраиваем валидацию в реальном времени
    RealtimeValidation.setupRealtimeValidation(this.fields, this);

    // Слушатели переключения calc-type и delivery-option
    this.setupCalcTypeReset();

    // Габариты/объём: ограничения, пересчёт и переключение режима
    VolumeManager.setupVolumeModeListeners(this.fields, this);

    // Слушатель глобальных изменений в State
    StateManager.setupStateEventListener(this);

    // Слушатель чекбокса адреса
    AddressManager.setupAddressCheckboxListener(this.fields, this);
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
        // Если необходимо, можно сбрасывать всю форму: this.resetAll();
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

    // (4) Сбрасываем State.clientData
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

    if (this.fields.address) {
      this.fields.address.value = "";
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

    // Проверка объёма или габаритов в зависимости от режима
    if (weightVolumeChange?.checked) {
      validations.push(
        ValidationMethods.validateNumber(
          this.fields,
          "totalVolume",
          { required: true, maxDecimals: 4 },
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
        { required: true, min: 5, maxDecimals: 2 },
        this
      )
    );
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

    const isValid = validations.every(Boolean);
    if (isValid) {
      this.saveToState();
    }
    return isValid;
  }

  validateSingleField(fieldName) {
    switch (fieldName) {
      case "totalVolume":
        if (this.fields.weightVolumeChange?.checked) {
          ValidationMethods.validateNumber(
            this.fields,
            "totalVolume",
            { required: true, maxDecimals: 4 },
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
          { required: true, min: 5, maxDecimals: 2 },
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

    let finalVolume = 0;
    if (this.fields.weightVolumeChange?.checked) {
      finalVolume = parseFloat(this.fields.totalVolume.value) || 0;
    } else {
      finalVolume = parseFloat(this.fields.totalVolumeCalculated.value) || 0;
    }

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
