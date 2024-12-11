// uiController.js
export class UIController {
  static showError(message) {
    // Предположим, есть div с классом error-box
    const errorBox = document.querySelector(".error-box");
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.classList.add("active");
    }
    console.error(message);
  }

  static clearError() {
    const errorBox = document.querySelector(".error-box");
    if (errorBox) {
      errorBox.textContent = "";
      errorBox.classList.remove("active");
    }
  }

  static showResults(
    results,
    {
      totalCost,
      selectedCurrency,
      costInDollar,
      totalVolume,
      totalWeight,
      quantity,
      density,
      categoryKey,
      packagingCost,
      currencyRuble,
      brandIncluded,
      packingTypeValue,
      calculateInsuranceCost,
      calculateTotalCost,
    }
  ) {
    const directionKeys = ["auto", "train", "avia"];
    results.forEach((res, idx) => {
      const directionName = directionKeys[idx];
      const calculationMode =
        res?.calculationMode === "weight" ? "по килограммам" : "по объему";

      const shippingCostDollar = (res?.cost || 0).toFixed(2);

      let pricePerKgDollar, pricePerKgRuble;
      if (calculationMode === "по объему") {
        const shippingCostInDollarNum = parseFloat(shippingCostDollar);
        pricePerKgDollar = (shippingCostInDollarNum / totalWeight).toFixed(2);
        pricePerKgRuble = (
          parseFloat(pricePerKgDollar) * currencyRuble
        ).toFixed(2);
      } else {
        pricePerKgDollar = (res?.pricePerKg || 0).toFixed(2);
        pricePerKgRuble = ((res?.pricePerKg || 0) * currencyRuble).toFixed(2);
      }

      const insuranceCostDollar = calculateInsuranceCost(
        res?.cost || 0,
        costInDollar
      ).toFixed(2);
      const totalCostFinal = calculateTotalCost(
        res?.cost || 0,
        packagingCost,
        parseFloat(insuranceCostDollar)
      );
      const totalCostFinalDollar = totalCostFinal.toFixed(2);
      const totalCostFinalRuble = (totalCostFinal * currencyRuble).toFixed(2);

      // Здесь просто выводим в консоль таблицу,
      // но можно также обновить элементы в интерфейсе по вашему желанию
      console.table({
        Направление: directionName,
        "Cтоимость товара": `${totalCost} ${
          selectedCurrency === "dollar"
            ? "$"
            : selectedCurrency === "ruble"
            ? "₽"
            : "¥"
        }`,
        "Выбранная валюта": selectedCurrency,
        "Стоимость товара в долларах": `${costInDollar.toFixed(2)} $`,
        Объем: totalVolume,
        Килограм: totalWeight,
        Количество: quantity,
        Плотность: density,
        "Категория груза": categoryKey,
        Тариф: calculationMode,
        "Стоимость за КГ": `${pricePerKgDollar} $ | ${pricePerKgRuble} ₽`,
        Бренд: brandIncluded ? "Да (Включено)" : "Нет",
        Упаковка: packingTypeValue,
        "Стоимость доставки": `${shippingCostDollar} $`,
        "Стоимость упаковки": `${packagingCost.toFixed(2)} $`,
        "Стоимость страховки": `${insuranceCostDollar} $`,
        "Общая стоимость": `${totalCostFinalDollar} $ | ${totalCostFinalRuble} ₽`,
      });
    });

    // Можно также добавить логику обновления интерфейса, например:
    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) resultBlock.classList.add("active");
  }
}
