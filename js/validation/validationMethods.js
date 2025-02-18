// validationMethods.js
import { State } from "../data/State.js";

export default class ValidationMethods {
  static validateNumber(fields, fieldName, options = {}, formInstance) {
    const field = fields[fieldName];
    if (!field) return true;

    const value = field.value.trim();
    const {
      required = false,
      min = null,
      maxDecimals = 2,
      maxValue = 10000,
    } = options;

    if (required && value === "") {
      formInstance.addError(field, "Заполните поле");
      return false;
    }

    const regex = new RegExp(`^\\d+(\\.\\d{0,${maxDecimals}})?$`);
    if (value && !regex.test(value)) {
      formInstance.addError(field, `Заполните поле правильно`);
      return false;
    }

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      if (min !== null && numericValue < min) {
        formInstance.addError(field, `Значение должно быть не менее ${min}`);
        return false;
      }
      if (numericValue > maxValue) {
        formInstance.addError(field, "Нет данных по этим параметрам");
        return false;
      }
    }

    return true;
  }

  static validateDimensions(fields, formInstance) {
    const { volumeLength, volumeWidth, volumeHeight } = fields;
    let isValid = true;
    [volumeLength, volumeWidth, volumeHeight].forEach((f) => {
      if (!f) return;
      const val = parseFloat(f.value.trim());
      if (isNaN(val) || val <= 0) {
        formInstance.addError(f, "Поля обязательны для заполнения");
        isValid = false;
      }
    });
    return isValid;
  }

  static validateCategory(formInstance) {
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

  static validateRadio(fieldName, formInstance) {
    const radios = document.querySelectorAll(`input[name="${fieldName}"]`);
    const isChecked = Array.from(radios).some((r) => r.checked);
    if (!isChecked && radios[0]) {
      formInstance.addError(radios[0], "Необходимо выбрать один из вариантов");
      return false;
    }
    return true;
  }

  static validateTnvedInput(fields, formInstance) {
    const field = fields.tnvedInput;
    const selectedItem = State.tnvedSelection?.selectedItem;

    if (!selectedItem) {
      formInstance.addError(field, "Нужно выбрать ТНВЭД из списка");
      return false;
    }

    const cd = State.clientData || {};
    if (
      cd.tnvedSelectedName == null ||
      cd.tnvedSelectedCode == null ||
      cd.tnvedSelectedImp == null
    ) {
      formInstance.addError(
        field,
        "Подождите, пока загрузится % пошлин и данные по ТНВЭД"
      );
      console.log(State.clientData);
      return false;
    }

    return true;
  }

  static validateAddress(fields, formInstance) {
    const addressField = fields.address;
    const addressError = State.addressError;

    if (fields.addressCheck?.checked && !State.address) {
      formInstance.addError(
        addressField,
        addressError || "Пожалуйста, выберите адрес."
      );
      return false;
    }

    if (addressError) {
      formInstance.addError(addressField, addressError);
      return false;
    }

    formInstance.removeError(addressField);
    return true;
  }

  static validateDeliveryOption(fields, formInstance) {
    const radio = document.querySelector(
      'input[name="delivery-option"]:checked'
    );
    if (!radio) {
      const firstRadio = document.querySelector(
        'input[name="delivery-option"]'
      );
      if (firstRadio) {
        formInstance.addError(
          firstRadio,
          "Пожалуйста, выберите способ доставки"
        );
      }
      return false;
    }
    if (radio.value === "delivery-and-pickup") {
      const isRedeemValid = ValidationMethods.validateRedeemItems(formInstance);
      const isClientValid =
        ValidationMethods.validateClientFields(formInstance);
      return isRedeemValid && isClientValid;
    }
    return true;
  }

  static validateRedeemItems(formInstance) {
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
        const value = item[propName]?.toString().trim() || "";
        const inputEl = container.querySelector(`[name="${inputName}"]`);

        if (!inputEl) continue;

        if (!value) {
          formInstance.addError(inputEl, "Заполните поле");
          isValid = false;
        } else {
          formInstance.removeError(inputEl);
        }
      }
    });

    return isValid;
  }

  static validateClientFields(formInstance) {
    let isValid = true;

    const nameEl = document.querySelector('input[name="client-name"]');
    const phoneEl = document.querySelector('input[name="client-phone"]');

    if (nameEl && !nameEl.value.trim()) {
      formInstance.addError(nameEl, "Заполните поле");
      isValid = false;
    } else if (nameEl) {
      formInstance.removeError(nameEl);
    }

    if (phoneEl && !phoneEl.value.trim()) {
      formInstance.addError(phoneEl, "Заполните поле");
      isValid = false;
    } else if (phoneEl) {
      formInstance.removeError(phoneEl);
    }

    return isValid;
  }
}
