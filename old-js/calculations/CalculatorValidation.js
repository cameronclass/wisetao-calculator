import { State } from "../data/State.js";

export class CalculatorValidation {
  constructor(fields) {
    this.fields = fields; // Поля для валидации
    this.errors = {}; // Список ошибок
    this.setupInputRestrictions(); // Ограничение ввода
    // Добавляем вызов реалтайм-валидации:
    this.setupRealtimeValidation();
  }

  // Ограничение ввода
  setupInputRestrictions() {
    const setupFieldRestriction = (field, regex, maxDecimals = null) => {
      field.addEventListener("input", () => {
        // 1) Убираем все лишние символы, кроме цифр, точки, запятой
        field.value = field.value.replace(regex, "");

        // 2) Заменяем все запятые на точки
        field.value = field.value.replace(/,/g, ".");

        // 3) Ограничиваем количество точек до 1 (опционально)
        const partsDot = field.value.split(".");
        if (partsDot.length > 2) {
          // Удаляем «лишние» точки
          field.value = partsDot[0] + "." + partsDot.slice(1).join("");
        }

        // 4) Ограничиваем число знаков после точки, если maxDecimals != null
        if (maxDecimals !== null && partsDot[1]?.length > maxDecimals) {
          field.value = `${partsDot[0]}.${partsDot[1].substring(
            0,
            maxDecimals
          )}`;
        }
      });
    };

    setupFieldRestriction(this.fields.totalVolume, /[^0-9.,]/g, 4);
    setupFieldRestriction(this.fields.totalWeight, /[^0-9.,]/g, 2);
    setupFieldRestriction(this.fields.totalCost, /[^0-9.,]/g, 2);
    setupFieldRestriction(this.fields.quantity, /[^0-9]/g);
  }

  /**
   * Регистрируем слушатели 'input' (или 'change') на полях,
   * чтобы при изменении заново проверять конкретное поле
   */
  setupRealtimeValidation() {
    // Например, хотим отслеживать поля: totalVolume, totalWeight, totalCost, quantity,
    // и т.д., включая tnved_input
    const fieldNamesToWatch = [
      "totalVolume",
      "totalWeight",
      "totalCost",
      "quantity",
      "tnvedInput", // наше поле
      // ... при необходимости другие
    ];

    fieldNamesToWatch.forEach((fieldName) => {
      const fieldEl = this.fields[fieldName];
      if (fieldEl) {
        fieldEl.addEventListener("input", () => {
          // При вводе очищаем ошибку у этого поля (если была),
          // и проверяем заново
          this.removeError(fieldEl);
          this.validateSingleField(fieldName);
        });
      }
    });

    // Аналогично для radio-кнопок, например, brand, category
    // Можно по 'change'
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        this.clearCategoryError();
        this.validateCategory();
      });
    });

    // Или если хотите при клике на radio:
    // let packingType = document.querySelectorAll('input[name="packing-type"]');
    // ...
  }

  validateSingleField(fieldName) {
    // Вызовем ту же логику, что в validateAll(),
    // но только для одного поля.
    // Можно выделить разные методы: validateNumber, validateTnvedInput и т.д.
    switch (fieldName) {
      case "totalVolume":
        if (this.fields.weightVolumeChange.checked) {
          // Если включен режим "ввести объём напрямую", то totalVolume обязательное
          this.validateNumber("totalVolume", {
            required: true,
            maxDecimals: 4,
          });
        } else {
          // иначе используем validateDimensions()
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
        this.validateNumber("totalCost", {
          required: true,
          maxDecimals: 2,
        });
        break;
      case "quantity":
        this.validateNumber("quantity", { required: true });
        break;
      case "tnvedInput":
        // если calc-customs, тогда validateTnvedInput
        const calcTypeRadio = document.querySelector(
          'input[name="calc-type"]:checked'
        );
        const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";
        if (calcType === "calc-customs") {
          this.validateTnvedInput();
        }
        break;
      default:
        // Другие поля
        break;
    }
  }

  validateTnvedInput() {
    const field = this.fields.tnvedInput;
    // Если пользователь выбрал `calc-customs`, то
    // нужно проверять: selectedItem != null
    const selectedItem = State.tnvedSelection.selectedItem;

    if (!selectedItem) {
      this.addError(field, "Нужно выбрать ТНВЭД из списка");
      return false;
    }
    return true;
  }

  clearFields(fields) {
    fields.forEach((field) => {
      if (field) field.value = ""; // Сбрасываем значение
    });
  }

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
    const isChecked = Array.from(radios).some((radio) => radio.checked);

    if (!isChecked) {
      this.addError(radios[0], "Необходимо выбрать один из вариантов");
      return false;
    }
    return true;
  }

  validateDimensions() {
    const { volumeLength, volumeWidth, volumeHeight } = this.fields;
    let isValid = true;

    [volumeLength, volumeWidth, volumeHeight].forEach((field) => {
      const value = parseFloat(field.value.trim());
      if (isNaN(value) || value <= 0) {
        this.addError(field, "Поля обязательны для заполнения");
        isValid = false;
      }
    });

    return isValid;
  }

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

    if (errorSpan) errorSpan.textContent = "";
    if (errorBlock) errorBlock.classList.remove("active");

    return true;
  }

  addError(field, message) {
    const parent = field.closest(".form-group") || field.parentElement;
    const errorSpan = parent.querySelector(".error-message");
    if (errorSpan) errorSpan.textContent = message;
    field.classList.add("error-input");
  }

  clearCategoryError() {
    // убираем текст и класс active из .js-error-category
    const errorSpan = document.querySelector(".error-message-category");
    const errorBlock = document.querySelector(".js-error-category");
    if (errorSpan) errorSpan.textContent = "";
    if (errorBlock) errorBlock.classList.remove("active");
  }

  removeError(fieldEl) {
    fieldEl.classList.remove("error-input");
    const parent = fieldEl.closest(".form-group") || fieldEl.parentElement;
    const errorSpan = parent.querySelector(".error-message");
    if (errorSpan) errorSpan.textContent = "";
  }

  clearErrors() {
    this.errors = {};
    document
      .querySelectorAll(".error-input")
      .forEach((el) => el.classList.remove("error-input"));
    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
    });

    this.clearCategoryError();
  }

  hideCalculationResult() {
    // 1) Скрываем блок с результатом
    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) {
      resultBlock.classList.remove("active");
    }
    // 2) Очищаем State, если нужно
    State.directionsData = {};
  }

  validateAll() {
    this.clearErrors();

    const calcTypeRadio = document.querySelector(
      'input[name="calc-type"]:checked'
    );
    const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";

    const { weightVolumeChange } = this.fields;

    // Базовые проверки
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
      calcType === "calc-cargo" ? this.validateCategory() : true,
      this.validateRadio("packing-type"),
      // Новая проверка для calc-customs:
      calcType === "calc-customs" ? this.validateTnvedInput() : true,
    ].every((result) => result);

    return isValid;
  }
}
