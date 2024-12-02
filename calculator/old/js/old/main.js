document.addEventListener("DOMContentLoaded", async () => {
  const botToken = "7077778313:AAGQu7UV0XiNs0z8aGDyQiCwaqzOEgZLnbQ";
  const chatId = "-413166690";

  try {
    const { currencyYuan, currencyDollar } =
      await CurrencyParser.getCurrencyRates(botToken, chatId);

    const rates = await loadJSON("/data/rates.json");
    if (!rates) return;

    const calculator = new Calculator(rates, currencyYuan, currencyDollar);
    const uiHandler = new UIHandler();

    document
      .querySelector(".js-calculate-result")
      .addEventListener("click", () => {
        if (!uiHandler.validateInputs()) return;

        const totalWeight = parseFloat(uiHandler.fields.totalWeight.value);
        const totalVolume = parseFloat(uiHandler.fields.totalVolume.value);
        const categoryKey = [...uiHandler.fields.category].find(
          (input) => input.checked
        ).value;

        const results = calculator.calculateTotalCost(
          totalWeight,
          totalVolume,
          categoryKey,
          parseFloat(uiHandler.fields.totalCost.value),
          parseInt(uiHandler.fields.quantity.value || 1),
          uiHandler.fields.packingType.value,
          uiHandler.fields.insurance.checked,
          uiHandler.fields.brand.checked
        );

        uiHandler.updateResults(results);
      });
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
  }
});
