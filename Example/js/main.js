document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Загрузка данных
    await loadRates();

    // Установка событий на кнопку "Рассчитать"
    const calculateButton = document.querySelector(".calculate-button");
    calculateButton.addEventListener("click", handleCalculate);
  } catch (error) {
    console.error("Ошибка инициализации калькулятора:", error.message);
  }
});

async function handleCalculate() {
  try {
    const isValid = validateAllFields();
    if (!isValid) {
      console.warn("Ошибка валидации");
      return;
    }
    const results = calculateResults();
    displayResults(results);
  } catch (error) {
    console.error("Ошибка при расчете:", error.message);
  }
}
