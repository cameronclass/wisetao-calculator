// realtimeValidation.js
import { State } from "../data/State.js";
import ValidationMethods from "./validationMethods.js";

export default class RealtimeValidation {
  static setupRealtimeValidation(fields, formInstance) {
    const fieldNamesToWatch = [
      "totalVolume",
      "totalWeight",
      "totalCost",
      "quantity",
      "tnvedInput",
      "quantity_checkbox",
    ];

    // 1) Валидация при вводе для отдельных полей
    fieldNamesToWatch.forEach((fieldName) => {
      const fieldEl = fields[fieldName];
      if (fieldEl) {
        fieldEl.addEventListener("input", () => {
          formInstance.removeError(fieldEl);
          formInstance.validateSingleField(fieldName);
          formInstance.hideCalculationResult();
        });
      }
    });

    // 2) Слушатель для изменения категории
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        formInstance.clearCategoryError();
        ValidationMethods.validateCategory(formInstance);
        formInstance.hideCalculationResult();
      });
    });

    // 3) Любое изменение полей скрывает результат расчёта
    const allFields = [
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
      ...Array.from(fields.category || []),
      ...Array.from(fields.packingType || []),
    ];

    allFields.forEach((field) => {
      if (field) {
        field.addEventListener("input", () => {
          formInstance.hideCalculationResult();
        });
      }
    });

    // 4) Дополнительная валидация для client-name и client-phone
    const nameField = document.querySelector('input[name="client-name"]');
    const phoneField = document.querySelector('input[name="client-phone"]');
    [nameField, phoneField].forEach((field) => {
      if (field) {
        field.addEventListener("input", () => {
          formInstance.removeError(field);
          formInstance.hideCalculationResult();
        });
      }
    });

    // 5) Реалтайм-валидация для redeem-полей
    const redeemFieldNames = [
      "data-name",
      "data_cost",
      "data-quantity",
      "data-color",
      "data-url",
      "data-size",
    ];

    redeemFieldNames.forEach((fieldName) => {
      document
        .querySelectorAll(`input[name="${fieldName}"]`)
        .forEach((field) => {
          field.addEventListener("input", () => {
            formInstance.removeError(field);
            formInstance.hideCalculationResult();
          });
        });
    });

    // Добавляем обработчик для quantity totalVolume totalWeight
    if (fields.quantity) {
      fields.quantity.addEventListener("input", function () {
        const quantityValue = parseInt(this.value) || 1;
        const checkboxElement = document.querySelector(".js-quantity-checkbox");
        const quantityCheck = fields.quantity_checkbox?.checked;

        if (checkboxElement) {
          checkboxElement.classList.toggle("active", quantityValue > 1);
        }

        // Если quantityValue равно 1 и чекбокс установлен
        if (quantityValue === 1 && quantityCheck) {
          // Убираем галочку и устанавливаем quantity_check в false
          fields.quantity_checkbox.checked = false;
          formInstance.updateState("clientData", {
            ...State.clientData,
            quantityCheck: false,
          });
        }

        formInstance.updateCalculatedData();
      });
    }
    if (formInstance.fields.quantity_checkbox) {
      formInstance.fields.quantity_checkbox.addEventListener(
        "change",
        function () {
          formInstance.updateCalculatedData();
        }
      );
    }
    [fields.totalVolume, fields.totalWeight].forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => {
        formInstance.updateCalculatedData();
      });
    });
  }
}
