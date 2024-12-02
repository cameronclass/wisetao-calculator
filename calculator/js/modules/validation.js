// Функция для проверки числового поля
function validateNumberField(field, options = {}) {
  const value = field.value.trim();
  const {
    min = null,
    max = null,
    decimalPlaces = 2,
    required = false,
  } = options;

  // Проверка на обязательность
  if (required && value === "") {
    return "Поле обязательно для заполнения";
  }

  // Проверка на число и допустимые знаки после точки
  const regex = new RegExp(`^\\d+(\\.\\d{0,${decimalPlaces}})?$`);
  if (value !== "" && !regex.test(value)) {
    return `Введите корректное число с не более чем ${decimalPlaces} знаками после точки`;
  }

  // Преобразуем в число для дальнейших проверок
  const numericValue = parseFloat(value);
  if (!isNaN(numericValue)) {
    if (min !== null && numericValue < min) {
      return `Значение должно быть не менее ${min}`;
    }
    if (max !== null && numericValue > max) {
      return `Значение должно быть не более ${max}`;
    }
  }

  return null; // Нет ошибок
}

// Функция для проверки радиокнопок
function validateRadioField(fieldName) {
  const fields = document.querySelectorAll(`input[name="${fieldName}"]`);
  const isChecked = Array.from(fields).some((field) => field.checked);

  if (!isChecked) {
    return "Необходимо выбрать один из вариантов";
  }

  return null; // Нет ошибок
}

// Основная функция валидации
function validateFields() {
  let isValid = true;

  // Очистка предыдущих ошибок
  document
    .querySelectorAll(".input-error")
    .forEach((el) => el.classList.remove("input-error"));
  document.querySelectorAll(".input-error-text").forEach((el) => el.remove());

  // Поля для проверки
  const fieldsToValidate = [
    {
      field: document.querySelector('input[name="total_volume"]'),
      options: { required: true, decimalPlaces: 2 },
    },
    {
      field: document.querySelector('input[name="total_weight"]'),
      options: { required: true, min: 5 },
    },
    {
      field: document.querySelector('input[name="quantity"]'),
      options: { required: true, min: 1 },
    },
    {
      field: document.querySelector('input[name="total_cost"]'),
      options: { required: true, decimalPlaces: 2 },
    },
  ];

  fieldsToValidate.forEach(({ field, options }) => {
    const errorMessage = validateNumberField(field, options);
    if (errorMessage) {
      isValid = false;
      showValidationError(field, errorMessage);
    }
  });

  // Валидация радиокнопок
  const radioFields = ["total_currecy", "category", "packing-type"];
  radioFields.forEach((fieldName) => {
    const errorMessage = validateRadioField(fieldName);
    if (errorMessage) {
      isValid = false;
      const firstField = document.querySelector(`input[name="${fieldName}"]`);
      showValidationError(firstField, errorMessage);
    }
  });

  return isValid;
}

// Функция для отображения ошибки
function showValidationError(field, message) {
  const parent = field.closest(".form-group") || field.parentElement;
  field.classList.add("input-error");

  const errorText = document.createElement("div");
  errorText.className = "input-error-text";
  errorText.textContent = message;

  parent.appendChild(errorText);
}

// Обработчик события на кнопку "Рассчитать"
document
  .querySelector(".js-calculate-result")
  .addEventListener("click", (e) => {
    e.preventDefault();

    const isValid = validateFields();
    if (isValid) {
      console.log("Валидация успешна, можно продолжить расчеты");
      // Здесь будет вызов функции для расчета
    } else {
      console.log("Валидация не прошла, исправьте ошибки");
    }
  });
