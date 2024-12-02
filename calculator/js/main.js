import {
  fetchCurrencyRates,
  displayCurrencyRates,
} from "./modules/currency-loader.js";
import { validateAllFields } from "./modules/validation.js";

document.addEventListener("DOMContentLoaded", async () => {
  await fetchCurrencyRates();
  displayCurrencyRates();

  const form = document.getElementById("calculator-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateAllFields()) {
      alert("Форма прошла валидацию!");
    } else {
      alert("Ошибка валидации!");
    }
  });
});
