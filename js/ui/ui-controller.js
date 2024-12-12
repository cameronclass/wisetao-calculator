import { State } from "../data/State.js";

// uiController.js
export class UIController {
  static showError(message) {
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
      currencyYuan,
      currencyRuble,
      brandIncluded,
      packingTypeValue,
      calculateInsuranceCost,
      calculateTotalCost,
    }
  ) {
    const directionKeys = ["auto", "train", "avia"];
    results.forEach((res, idx) => {
      const directionName = directionKeys[idx]; // 'auto', 'train' или 'avia'
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

      // Сохраняем данные в State
      State.setDirectionData(directionName, {
        currencyYuan: currencyYuan, // Передаем реальное значение yuan
        currencyRuble: currencyRuble,
        costInDollar: costInDollar,
        totalCostFinalDollar: parseFloat(totalCostFinalDollar),
        totalCostFinalRuble: parseFloat(totalCostFinalRuble),
        totalVolume: totalVolume,
        totalWeight: totalWeight,
        quantity: quantity,
        pricePerKgDollar: pricePerKgDollar,
        pricePerKgRuble: pricePerKgRuble,
        packingTypeValue: packingTypeValue,
        packagingCost: packagingCost, // в долларах
        insuranceCostDollar: parseFloat(insuranceCostDollar),
      });

      // Вывод в консоль (как было ранее)
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

      // Дополнительное обновление HTML
      // Находим нужный блок по направлению: .price-auto, .price-train, .price-avia
      const priceBlock = document.querySelector(`.price-${directionName}`);
      if (priceBlock) {
        // Обновляем текст "Стоимость за КГ"
        const titleTarif = priceBlock.querySelector(
          ".calculate-result__title_tarif"
        );
        if (titleTarif) {
          titleTarif.textContent = "За КГ:";
        }

        // Обновляем стоимость за КГ в долларах
        const kgDollarEl = priceBlock.querySelector(".calculate-result__kg");
        if (kgDollarEl) {
          kgDollarEl.textContent = pricePerKgDollar;
        }

        // Обновляем стоимость за КГ в рублях
        const kgRubleEl = priceBlock.querySelector(
          ".calculate-result__kg_ruble"
        );
        if (kgRubleEl) {
          kgRubleEl.textContent = pricePerKgRuble;
        }

        // Обновляем общую стоимость в долларах
        const dollarEl = priceBlock.querySelector(".calculate-result__dollar");
        if (dollarEl) {
          dollarEl.textContent = totalCostFinalDollar;
        }

        // Обновляем общую стоимость в рублях
        const rubleEl = priceBlock.querySelector(".calculate-result__ruble");
        if (rubleEl) {
          rubleEl.textContent = totalCostFinalRuble;
        }
      }
    });

    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) resultBlock.classList.add("active");
  }
}
