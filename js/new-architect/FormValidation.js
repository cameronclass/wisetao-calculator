// FormValidation.js
import Address from "../api/Address.js";
import { State } from "../data/State.js";
import stateManager from "./StateManager.js";
import Validator from "./Validator.js";
import UIHelper from "./UIHelper.js";

// Конфигурация валидации для числовых полей
const defaultValidationRules = {
  totalCost: { required: true, type: "number", maxDecimals: 2 },
  totalWeight: { required: true, type: "number", min: 5, maxDecimals: 2 },
  totalVolume: { required: true, type: "number", maxDecimals: 4 },
  quantity: { required: true, type: "number", maxDecimals: 0 },
  tnvedInput: { required: true },
};

class FormValidation {
  constructor(fields) {
    this.fields = fields;

    // Список полей для сброса (ссылки остаются, но сброс не требуется)
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

    // Инициализируем начальное состояние адреса
    stateManager.update("addressError", null);

    // Инициализируем обработчик адреса
    this.addressHandler = new Address('input[name="address"]');

    // Инициализируем валидатор
    this.validator = new Validator(defaultValidationRules);

    // Установка слушателей и ограничений
    this.setupInputRestrictions();
    this.setupRealtimeValidation();
    this.setupCalcTypeReset();
    this.setupNumericVolumeRestrictions();
    this.setupVolumeModeListeners();
    this.setupStateListener();
    this.setupAddressCheckboxListener();
  }

  setupStateListener() {
    stateManager.subscribe(({ prop, value }) => {
      this.handleStateChange(prop, value);
    });
  }

  handleStateChange(prop, value) {
    if (prop === "address") {
      if (value) {
        // Если адрес выбран, сбрасываем ошибку
        stateManager.update("addressError", null);
        UIHelper.removeError(this.fields.address);
      } else if (State.addressError) {
        UIHelper.addError(this.fields.address, State.addressError);
      }
      UIHelper.hideCalculationResult();
    }
    if (prop === "addressError") {
      if (value) {
        UIHelper.addError(this.fields.address, value);
      } else {
        UIHelper.removeError(this.fields.address);
      }
      UIHelper.hideCalculationResult();
    }
  }

  setupInputRestrictions() {
    const setupFieldRestriction = (field, regex, maxDecimals = null) => {
      if (!field) return;
      field.addEventListener("input", () => {
        field.value = field.value.replace(regex, "");
        field.value = field.value.replace(/,/g, ".");
        const parts = field.value.split(".");
        if (parts.length > 2) {
          field.value = parts[0] + "." + parts.slice(1).join("");
        }
        if (maxDecimals !== null && parts[1]?.length > maxDecimals) {
          field.value = `${parts[0]}.${parts[1].substring(0, maxDecimals)}`;
        }
      });
    };

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

    fieldNamesToWatch.forEach((fieldName) => {
      const fieldEl = this.fields[fieldName];
      if (fieldEl) {
        fieldEl.addEventListener("input", () => {
          UIHelper.removeError(fieldEl);
          this.validateSingleField(fieldName);
          UIHelper.hideCalculationResult();
        });
      }
    });

    // Слушатели для изменения категории – используем нашу валидацию
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        this.clearCategoryError();
        this.validateCategory();
        UIHelper.hideCalculationResult();
      });
    });

    // Любое изменение поля – скрыть результат расчёта
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
          UIHelper.hideCalculationResult();
        });
      }
    });

    // Реалтайм-валидация для client-name и client-phone
    const nameField = document.querySelector('input[name="client-name"]');
    const phoneField = document.querySelector('input[name="client-phone"]');
    [nameField, phoneField].forEach((field) => {
      if (field) {
        field.addEventListener("input", () => {
          UIHelper.removeError(field);
          UIHelper.hideCalculationResult();
        });
      }
    });

    // Реалтайм-валидация для redeem-полей
    const redeemFieldNames = [
      "data-name",
      "data_cost",
      "data-quantity",
      "data-color",
      "data-url",
      "data-size",
    ];
    redeemFieldNames.forEach((fieldName) => {
      document.querySelectorAll(`input[name="${fieldName}"]`).forEach((field) => {
        field.addEventListener("input", () => {
          UIHelper.removeError(field);
          UIHelper.hideCalculationResult();
        });
      });
    });
  }

  setupCalcTypeReset() {
    const calcTypeRadios = document.querySelectorAll('input[name="calc-type"]');
    calcTypeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        // При смене калькулятора ничего не сбрасываем, лишь скрываем результат
        UIHelper.hideCalculationResult();
      });
    });
  }

  // Метод resetAll больше не очищает поля и состояние, а только скрывает результат
  resetAll() {
    UIHelper.hideCalculationResult();
  }

  setupVolumeModeListeners() {
    const { weightVolumeChange, volumeLength, volumeWidth, volumeHeight } = this.fields;

    if (weightVolumeChange) {
      weightVolumeChange.addEventListener("change", () => {
        this.toggleVolumeMode();
        if (weightVolumeChange.checked) {
          UIHelper.clearErrors();
          this.clearFields([volumeLength, volumeWidth, volumeHeight]);
        } else {
          UIHelper.clearErrors();
          this.clearFields([this.fields.totalVolume]);
        }
        UIHelper.hideCalculationResult();
      });
    }

    [volumeLength, volumeWidth, volumeHeight].forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => {
        this.calculateVolume();
        UIHelper.hideCalculationResult();
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
      if (totalVolume) totalVolume.disabled = false;
      if (volumeLength) volumeLength.disabled = true;
      if (volumeWidth) volumeWidth.disabled = true;
      if (volumeHeight) volumeHeight.disabled = true;
      if (totalVolumeCalculated) {
        totalVolumeCalculated.value = "";
        totalVolumeCalculated.disabled = true;
      }
    } else {
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
    const { volumeLength, volumeWidth, volumeHeight, totalVolumeCalculated } = this.fields;
    if (!volumeLength || !volumeWidth || !volumeHeight || !totalVolumeCalculated) return;
    const length = parseFloat(volumeLength.value) || 0;
    const width = parseFloat(volumeWidth.value) || 0;
    const height = parseFloat(volumeHeight.value) || 0;
    const calcVol = (length * width * height) / 1_000_000;
    totalVolumeCalculated.value = calcVol > 0 ? calcVol.toFixed(4) : "";
  }

  validateAll() {
    UIHelper.clearErrors();

    const calcTypeRadio = document.querySelector('input[name="calc-type"]:checked');
    const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";
    const { weightVolumeChange } = this.fields;
    let isValid = true;

    // Если выбран режим ввода объёма напрямую
    if (weightVolumeChange?.checked) {
      const error = this.validator.validateField(
        "totalVolume",
        this.fields.totalVolume.value,
        { required: true, maxDecimals: 4 }
      );
      if (error) {
        UIHelper.addError(this.fields.totalVolume, error);
        isValid = false;
      }
    } else {
      const dimErrors = this.validator.validateDimensions({
        volumeLength: this.fields.volumeLength,
        volumeWidth: this.fields.volumeWidth,
        volumeHeight: this.fields.volumeHeight,
      });
      Object.keys(dimErrors).forEach((key) => {
        const field = this.fields[key];
        if (field) UIHelper.addError(field, dimErrors[key]);
      });
      if (Object.keys(dimErrors).length > 0) {
        isValid = false;
      }
    }

    // Валидация числовых полей
    const numberFields = ["totalWeight", "quantity", "totalCost"];
    numberFields.forEach((fieldName) => {
      const field = this.fields[fieldName];
      const rule = defaultValidationRules[fieldName];
      if (field) {
        const error = this.validator.validateField(fieldName, field.value, rule);
        if (error) {
          UIHelper.addError(field, error);
          isValid = false;
        }
      }
    });

    const radioError = this.validator.validateRadio("total_currency");
    if (radioError) {
      const radio = document.querySelector('input[name="total_currency"]');
      if (radio) UIHelper.addError(radio, radioError);
      isValid = false;
    }

    // Валидация категории через наш метод (как было у вас)
    if (calcType === "calc-cargo") {
      if (!this.validateCategory()) {
        isValid = false;
      }
    }

    const packingError = this.validator.validateRadio("packing-type");
    if (packingError) {
      const radio = document.querySelector('input[name="packing-type"]');
      if (radio) UIHelper.addError(radio, packingError);
      isValid = false;
    }

    if (calcType === "calc-customs") {
      const tnvedError = this.validator.validateTnvedInput(this.fields.tnvedInput.value);
      if (tnvedError) {
        UIHelper.addError(this.fields.tnvedInput, tnvedError);
        isValid = false;
      }
    }

    // Используем метод validateAddress(), реализованный как у вас ранее
    if (!this.validateAddress()) {
      isValid = false;
    }

    const deliveryError = this.validator.validateDeliveryOption();
    if (deliveryError) {
      const firstRadio = document.querySelector('input[name="delivery-option"]');
      if (firstRadio) UIHelper.addError(firstRadio, deliveryError);
      isValid = false;
    } else {
      if (this.fields.deliveryOption && this.fields.deliveryOption.value === "delivery-and-pickup") {
        const redeemValid = this.validator.validateRedeemItems();
        const clientErrors = this.validator.validateClientFields();
        Object.keys(clientErrors).forEach((key) => {
          const field = document.querySelector(`input[name="${key}"]`);
          if (field) UIHelper.addError(field, clientErrors[key]);
        });
        if (!redeemValid || Object.keys(clientErrors).length > 0) {
          isValid = false;
        }
      }
    }

    if (isValid) {
      this.saveToState();
    }
    return isValid;
  }

  validateSingleField(fieldName) {
    switch (fieldName) {
      case "totalVolume":
        if (this.fields.weightVolumeChange?.checked) {
          const error = this.validator.validateField(
            "totalVolume",
            this.fields.totalVolume.value,
            { required: true, maxDecimals: 4 }
          );
          if (error) UIHelper.addError(this.fields.totalVolume, error);
        } else {
          const dimErrors = this.validator.validateDimensions({
            volumeLength: this.fields.volumeLength,
            volumeWidth: this.fields.volumeWidth,
            volumeHeight: this.fields.volumeHeight,
          });
          Object.keys(dimErrors).forEach((key) => {
            const field = this.fields[key];
            if (field) UIHelper.addError(field, dimErrors[key]);
          });
        }
        break;
      case "totalWeight":
        const weightError = this.validator.validateField(
          "totalWeight",
          this.fields.totalWeight.value,
          { required: true, min: 5, maxDecimals: 2 }
        );
        if (weightError) UIHelper.addError(this.fields.totalWeight, weightError);
        break;
      case "totalCost":
        const costError = this.validator.validateField(
          "totalCost",
          this.fields.totalCost.value,
          { required: true, maxDecimals: 2 }
        );
        if (costError) UIHelper.addError(this.fields.totalCost, costError);
        break;
      case "quantity":
        const quantityError = this.validator.validateField("quantity", this.fields.quantity.value, { required: true });
        if (quantityError) UIHelper.addError(this.fields.quantity, quantityError);
        break;
      case "tnvedInput":
        const calcTypeRadio = document.querySelector('input[name="calc-type"]:checked');
        const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";
        if (calcType === "calc-customs") {
          const tnvedError = this.validator.validateTnvedInput(this.fields.tnvedInput.value);
          if (tnvedError) UIHelper.addError(this.fields.tnvedInput, tnvedError);
        }
        break;
      default:
        break;
    }
  }

  // Реализация валидации категории как у вас:
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

  saveToState() {
    const calcType = document.querySelector('input[name="calc-type"]:checked')?.value || "calc-cargo";
    const categoryEl = Array.from(this.fields.category).find((r) => r.checked);
    const packingTypeEl = Array.from(this.fields.packingType).find((r) => r.checked);

    let finalVolume = 0;
    if (this.fields.weightVolumeChange?.checked) {
      finalVolume = parseFloat(this.fields.totalVolume.value) || 0;
    } else {
      finalVolume = parseFloat(this.fields.totalVolumeCalculated.value) || 0;
    }

    State.clientData.calcType = calcType;
    State.clientData.totalCost = parseFloat(this.fields.totalCost.value) || 0;
    State.clientData.currency =
      document.querySelector('input[name="total_currency"]:checked')?.value || "dollar";
    State.clientData.totalWeight = parseFloat(this.fields.totalWeight.value) || 0;
    State.clientData.totalVolume = finalVolume;
    State.clientData.volumeLength = parseFloat(this.fields.volumeLength.value) || 0;
    State.clientData.volumeWidth = parseFloat(this.fields.volumeWidth.value) || 0;
    State.clientData.volumeHeight = parseFloat(this.fields.volumeHeight.value) || 0;
    State.clientData.quantity = parseInt(this.fields.quantity.value, 10) || 0;
    State.clientData.categoryKey = categoryEl ? categoryEl.value : null;
    State.clientData.packingType = packingTypeEl ? packingTypeEl.value : null;
    State.clientData.insurance = !!this.fields.insurance?.checked;
    State.clientData.brand = !!this.fields.brand?.checked;
    State.clientData.tnvedInput = this.fields.tnvedInput.value.trim();
    const deliveryOptionRadio = document.querySelector('input[name="delivery-option"]:checked');
    State.clientData.deliveryOption = deliveryOptionRadio ? deliveryOptionRadio.value : null;
    if (State.address) {
      State.clientData.address = { ...State.address };
    } else {
      State.clientData.address = null;
    }
  }

  // Реализация валидации адреса, как у вас было:
  validateAddress() {
    const addressField = this.fields.address;
    const addressError = State.addressError;

    // Если чекбокс включён, а адрес не выбран
    if (this.fields.addressCheck?.checked && !State.address) {
      UIHelper.addError(addressField, addressError || "Пожалуйста, выберите адрес.");
      return false;
    }

    // Если есть ошибка в State.addressError
    if (addressError) {
      UIHelper.addError(addressField, addressError);
      return false;
    }

    // Убираем ошибку, если всё хорошо
    UIHelper.removeError(addressField);
    return true;
  }

  setupAddressCheckboxListener() {
    const addressCheckbox = this.fields.addressCheck;
    if (!addressCheckbox) {
      console.warn('Чекбокс адреса не найден.');
      return;
    }

    // Изначальное состояние – отображаем связанные с адресом элементы
    UIHelper.toggleToAddressElements(State.clientData.addressCheck);
    this.handleAddressCheckboxChange(State.clientData.addressCheck);

    addressCheckbox.addEventListener("change", (event) => {
      const isChecked = event.target.checked;
      UIHelper.toggleToAddressElements(isChecked);
      this.handleAddressCheckboxChange(isChecked);
      UIHelper.hideCalculationResult();

      if (isChecked && !State.address) {
        stateManager.update("addressError", "Пожалуйста, выберите адрес из списка.");
      } else if (!isChecked) {
        stateManager.update("addressError", null);
      }
    });
  }

  handleAddressCheckboxChange(isChecked) {
    if (!isChecked && State.address) {
      this.fields.address.value = "";
      stateManager.update("address", null);
      stateManager.update("addressError", null);
      UIHelper.removeError(this.fields.address);
    }
  }

  clearFields(fields) {
    fields.forEach((field) => {
      if (field) field.value = "";
    });
  }
}

export default FormValidation;
