// Validator.js
import { State } from "../data/State.js";

class Validator {
  constructor(rules) {
    this.rules = rules;
  }

  validateField(fieldName, value, options = {}) {
    const rule = { ...this.rules[fieldName], ...options };
    if (rule.required && value.trim() === "") {
      return "Заполните поле";
    }
    if (rule.type === "number") {
      const regex = new RegExp(`^\\d+(\\.\\d{0,${rule.maxDecimals || 2}})?$`);
      if (value && !regex.test(value)) {
        return `Введите число с не более ${
          rule.maxDecimals || 2
        } знаками после точки`;
      }
      const numericValue = parseFloat(value);
      if (
        !isNaN(numericValue) &&
        rule.min !== undefined &&
        numericValue < rule.min
      ) {
        return `Значение должно быть не менее ${rule.min}`;
      }
    }
    return null;
  }

  validateDimensions(fields) {
    let errors = {};
    const keys = ["volumeLength", "volumeWidth", "volumeHeight"];
    keys.forEach((key) => {
      const val = parseFloat(fields[key].value.trim());
      if (isNaN(val) || val <= 0) {
        errors[key] = "Поля обязательны для заполнения";
      }
    });
    return errors;
  }

  validateRadio(fieldName) {
    const radios = document.querySelectorAll(`input[name="${fieldName}"]`);
    const isChecked = Array.from(radios).some((r) => r.checked);
    if (!isChecked && radios[0]) {
      return "Необходимо выбрать один из вариантов";
    }
    return null;
  }

  validateTnvedInput(fieldValue) {
    const selectedItem = State.tnvedSelection?.selectedItem;
    if (!selectedItem) {
      return "Нужно выбрать ТНВЭД из списка";
    }
    const cd = State.clientData || {};
    if (
      cd.tnvedSelectedName == null ||
      cd.tnvedSelectedCode == null ||
      cd.tnvedSelectedImp == null
    ) {
      return "Подождите, пока загрузится % пошлин и данные по ТНВЭД";
    }
    return null;
  }

  validateDeliveryOption() {
    const radio = document.querySelector(
      'input[name="delivery-option"]:checked'
    );
    if (!radio) {
      return "Пожалуйста, выберите способ доставки";
    }
    return null;
  }

  validateRedeemItems() {
    let isValid = true;
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
      const container = document.querySelector(`[data-redeem="${index}"]`);
      if (!container) return;
      for (const [propName, inputName] of Object.entries(requiredFieldsMap)) {
        const value = (item[propName] || "").toString().trim();
        const inputEl = container.querySelector(`[name="${inputName}"]`);
        if (!inputEl) continue;
        if (!value) {
          isValid = false;
          // Отображение ошибки оставим на уровне UIHelper (если понадобится)
        }
      }
    });
    return isValid;
  }

  validateClientFields() {
    let errors = {};
    const nameEl = document.querySelector('input[name="client-name"]');
    const phoneEl = document.querySelector('input[name="client-phone"]');

    if (nameEl && !nameEl.value.trim()) {
      errors["client-name"] = "Заполните поле";
    }
    if (phoneEl && !phoneEl.value.trim()) {
      errors["client-phone"] = "Заполните поле";
    }
    return errors;
  }
}

export default Validator;
