class Validation {
  constructor(fields) {
    this.fields = fields;
    this.errors = {};
    this.setupInputRestrictions();
  }

  setupInputRestrictions() {
    const numericFields = [
      "totalWeight",
      "totalVolume",
      "totalVolumeCalculated",
      "quantity",
      "totalCost",
    ];
    numericFields.forEach((fieldName) => {
      const field = this.fields[fieldName];
      if (field) {
        field.addEventListener("input", () => {
          field.value = field.value.replace(/[^0-9.]/g, "");
          if ((field.value.match(/\./g) || []).length > 1) {
            field.value = field.value.replace(/\.+$/, "");
          }
          const parts = field.value.split(".");
          if (parts[1]?.length > 2) {
            field.value = `${parts[0]}.${parts[1].substring(0, 2)}`;
          }
        });
      }
    });
  }

  validateRequired(fieldName) {
    const value = this.fields[fieldName]?.value.trim();
    if (!value) {
      this.addError(fieldName, "Поле обязательно для заполнения");
      return false;
    }
    return true;
  }

  validateNumber(fieldName, options = {}) {
    const { min, decimalPlaces = 2 } = options;
    const value = this.fields[fieldName]?.value.trim();
    const regex = new RegExp(`^\\d+(\\.\\d{0,${decimalPlaces}})?$`);
    if (!value || !regex.test(value)) {
      this.addError(
        fieldName,
        `Введите корректное число с не более чем ${decimalPlaces} знаками после точки`
      );
      return false;
    }
    const numericValue = parseFloat(value);
    if (min !== undefined && numericValue < min) {
      this.addError(fieldName, `Значение должно быть не менее ${min}`);
      return false;
    }
    return true;
  }

  addError(fieldName, message) {
    this.errors[fieldName] = message;
  }

  clearErrors() {
    document
      .querySelectorAll(".input-error")
      .forEach((el) => el.classList.remove("input-error"));
    document.querySelectorAll(".input-error-text").forEach((el) => el.remove());
  }

  showErrors() {
    Object.keys(this.errors).forEach((fieldName) => {
      const field = this.fields[fieldName];
      const parent = field.closest(".form-group") || field.parentElement;
      field.classList.add("input-error");
      const errorText = document.createElement("div");
      errorText.className = "input-error-text";
      errorText.textContent = this.errors[fieldName];
      parent.appendChild(errorText);
    });
  }

  validateAll() {
    this.clearErrors();
    this.validateRequired("totalWeight");
    this.validateNumber("totalWeight", { min: 5 });
    return Object.keys(this.errors).length === 0;
  }
}

window.Validation = Validation;
