function validateField(input, rules) {
  const value = input.value.trim();
  if (rules.required && !value) {
    showError(input, "Поле обязательно для заполнения.");
    return false;
  }
  if (rules.regex && !rules.regex.test(value)) {
    showError(input, "Неверный формат.");
    return false;
  }
  if (rules.min && value < rules.min) {
    showError(input, `Минимальное значение: ${rules.min}`);
    return false;
  }
  clearError(input);
  return true;
}

function showError(input, message) {
  input.classList.add("error");
  const errorMessage = input.parentElement.querySelector(".error-message");
  if (errorMessage) errorMessage.textContent = message;
}

function clearError(input) {
  input.classList.remove("error");
  const errorMessage = input.parentElement.querySelector(".error-message");
  if (errorMessage) errorMessage.textContent = "";
}

function validateAllFields() {
  const fields = document.querySelectorAll("input, select");
  let isValid = true;

  fields.forEach((field) => {
    const rules = validationRules[field.name];
    if (rules && !validateField(field, rules)) {
      isValid = false;
    }
  });

  return isValid;
}

const validationRules = {
  total_volume: { required: true, regex: /^[0-9]+(\.[0-9]{1,2})?$/ },
  total_weight: { required: true, min: 5 },
  quantity: { required: true, min: 1 },
  total_cost: { required: true, regex: /^[0-9]+(\.[0-9]{1,2})?$/ },
};

export { validateAllFields };
