// uiController.js
import { State } from "../data/State.js";

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

  /**
   * showResults
   * @param {Array}  results - [{cost, pricePerKg, calculationMode}, ...] для auto/train/avia
   * @param {Object} data - все входные/выходные параметры, включая:
   *
   *   calcType: 'calc-cargo' | 'calc-customs'
   *
   *   // Данные от пользователя:
   *   totalCost,            // Сумма, которую ввёл пользователь
   *   selectedCurrency,     // 'dollar' | 'ruble' | 'yuan'
   *   costInDollar,         // totalCost в долларах (переведён DeliveryCalculator)
   *   totalVolume,
   *   totalWeight,
   *   quantity,
   *   density,
   *   categoryKey,          // Если cargo
   *   packagingCost,
   *   brandIncluded,
   *   packingTypeValue,
   *
   *   // Курсы:
   *   currencyRuble, // Wisetao
   *   currencyYuan,  // Wisetao
   *   cbrRuble,      // ЦБ
   *   cbrYuan,       // ЦБ
   *
   *   // Тамож. данные (если calc-customs):
   *   dutyValue,   // % пошлины (например, 15)
   *   ndsValue,    // % НДС, обычно 20
   *   declRub,     // услуги декларации в рублях
   *   totalAllDollar, // Перевозка+таможня в $
   *   totalAllRub,    // Перевозка+таможня в ₽
   *
   *   // Методы:
   *   calculateInsuranceCost,
   *   calculateTotalCost
   */
  static showResults(results, data) {
    const {
      calcType, // 'calc-cargo' | 'calc-customs'
      totalCost,
      selectedCurrency,
      costInDollar,
      totalVolume,
      totalWeight,
      quantity,
      density,
      categoryKey,
      packagingCost,
      brandIncluded,
      packingTypeValue,

      // Курсы
      currencyRuble, // Wisetao
      currencyYuan, // Wisetao
      cbrRuble,
      cbrYuan,

      // Таможня (если calc-customs)
      dutyValue,
      ndsValue, // если надо, по умолчанию 20
      declRub,
      totalAllDollar,
      totalAllRub,

      calculateInsuranceCost,
      calculateTotalCost,
    } = data;

    // Массив направлений
    const directionKeys = ["auto", "train", "avia"];

    // Для расширенного вывода в консоль подготовим массив строк
    const bigConsoleRows = [];

    // Перебираем все три направления
    results.forEach((res, idx) => {
      // Определяем ключ направления: auto | train | avia
      const directionName = directionKeys[idx];
      // Как считаем: weight | volume
      const calculationMode =
        res?.calculationMode === "weight" ? "по весу" : "по объему";

      // Само значение перевозки (в долларах)
      const shippingCostDollar = parseFloat(res?.cost || 0);

      // Считаем «за КГ»
      let pricePerKgDollar, pricePerKgRuble;
      if (calculationMode === "по объему") {
        // shipping / totalWeight
        pricePerKgDollar = shippingCostDollar / (totalWeight || 1);
      } else {
        // res.pricePerKg
        pricePerKgDollar = parseFloat(res?.pricePerKg || 0);
      }
      pricePerKgDollar = +pricePerKgDollar.toFixed(2); // округлим
      pricePerKgRuble = +(pricePerKgDollar * currencyRuble).toFixed(2);

      // Считаем страховку (в долларах)
      const insuranceUsd = calculateInsuranceCost(
        shippingCostDollar,
        costInDollar
      );
      const insuranceCostDollar = +insuranceUsd.toFixed(2);

      // CARGO-сумма (shipping + packaging + insurance)
      const cargoUsd = calculateTotalCost(
        shippingCostDollar,
        packagingCost,
        insuranceCostDollar
      );
      const cargoDollar = +cargoUsd.toFixed(2);
      const cargoRuble = +(cargoUsd * currencyRuble).toFixed(2);

      // Если calc-cargo => показываем cargo
      // Если calc-customs => показываем totalAllDollar / totalAllRub
      let finalDollar = 0;
      let finalRuble = 0;
      if (calcType === "calc-cargo") {
        finalDollar = cargoDollar;
        finalRuble = cargoRuble;
      } else {
        // calc-customs => суммарная величина (если DeliveryCalculator уже сложил всё)
        finalDollar = parseFloat(totalAllDollar || 0);
        finalRuble = parseFloat(totalAllRub || 0);
      }

      // Сохраняем данные в State (для PDF)
      State.setDirectionData(directionName, {
        currencyYuan,
        currencyRuble,
        costInDollar,
        totalCostFinalDollar: finalDollar,
        totalCostFinalRuble: finalRuble,
        totalVolume,
        totalWeight,
        quantity,
        pricePerKgDollar: pricePerKgDollar.toFixed(2),
        pricePerKgRuble: pricePerKgRuble.toFixed(2),
        packingTypeValue,
        packagingCost,
        insuranceCostDollar,
      });

      // Собираем строку для console.table
      bigConsoleRows.push({
        Направление: directionName,
        Калькуляция: calcType,
        "Входная сумма (польз.)": `${totalCost} ${selectedCurrency}`,
        "В $ (costInDollar)": `${costInDollar.toFixed(2)}$`,
        "Объём (m³)": totalVolume,
        "Вес (кг)": totalWeight,
        Количество: quantity,
        Плотность: density,
        "Категория груза": categoryKey || "(—)",
        TarifMode: calculationMode,
        "Перевозка($)": shippingCostDollar.toFixed(2),
        "Price/kg($)": pricePerKgDollar.toFixed(2),
        "Упаковка($)": packagingCost.toFixed(2),
        "Страховка($)": insuranceCostDollar.toFixed(2),
        "Итог(CARGO)($)": `${cargoDollar.toFixed(2)}`,
        "Итог(CARGO)(₽)": `${cargoRuble.toFixed(2)}`,
        "Итог(RES)($)": finalDollar.toFixed(2),
        "Итог(RES)(₽)": finalRuble.toFixed(2),
      });

      // --- Обновляем DOM ---
      const priceBlock = document.querySelector(`.price-${directionName}`);
      if (!priceBlock) return;
      const kgDollarEl = priceBlock.querySelector(".calculate-result__kg");
      const kgRubleEl = priceBlock.querySelector(".calculate-result__kg_ruble");
      if (kgDollarEl) kgDollarEl.textContent = pricePerKgDollar.toFixed(2);
      if (kgRubleEl) kgRubleEl.textContent = pricePerKgRuble.toFixed(2);

      const dollarEl = priceBlock.querySelector(".calculate-result__dollar");
      const rubleEl = priceBlock.querySelector(".calculate-result__ruble");
      if (dollarEl) dollarEl.textContent = finalDollar.toFixed(2);
      if (rubleEl) rubleEl.textContent = finalRuble.toFixed(2);

      // Найдём tooltip (каждый блок .price-cell -> .overflow-info)
      const overflowInfo = priceBlock
        .closest(".price-cell")
        ?.querySelector(".overflow-info");
      if (!overflowInfo) return;
      const tooltip = overflowInfo.querySelector(".main-calc-result-tooltip");
      if (!tooltip) return;

      // Заголовок
      const tooltipTitle = tooltip.querySelector(
        ".main-calc-result-tooltip__title"
      );
      const whiteBlock = tooltip.querySelector(
        ".main-calc-result-tooltip__white"
      );

      // Курс: ._number._ruble, ._number._yuan
      const rubleSpan = tooltip.querySelector("._number._ruble");
      const yuanSpan = tooltip.querySelector("._number._yuan");

      // Итого(CARGO):
      const cargoDollarEl = tooltip.querySelector("._all-cargo-dollar");
      const cargoRubleEl = tooltip.querySelector("._all-cargo-ruble");

      // Таможня:
      const chosenImpEl = tooltip.querySelector("._chosen-imp");
      const ndsEl = tooltip.querySelector("._nds");
      const declDollarEl = tooltip.querySelector("._decloration-dollar");
      const declRubleEl = tooltip.querySelector("._decloration-ruble");
      const allWhiteDollarEl = tooltip.querySelector("._all-white-dollar");
      const allWhiteRubleEl = tooltip.querySelector("._all-white-ruble");
      const allCalculatedDollarEl = tooltip.querySelector(
        "._all-calculated-price-dollar"
      );
      const allCalculatedRubleEl = tooltip.querySelector(
        "._all-calculated-price-ruble"
      );

      // Заполняем поля
      if (calcType === "calc-cargo") {
        // 1) Заголовок
        if (tooltipTitle) {
          tooltipTitle.textContent =
            "Только до терминала ТК “Южные ворота” Москва";
        }
        // 2) Скрыть тамож. блок
        if (whiteBlock) {
          whiteBlock.classList.remove("active");
        }
        // 3) Курс Wisetao
        if (rubleSpan)
          rubleSpan.textContent = currencyRuble?.toFixed?.(2) || "0.00";
        if (yuanSpan)
          yuanSpan.textContent = currencyYuan?.toFixed?.(2) || "0.00";
        // 4) Итого (CARGO)
        if (cargoDollarEl)
          cargoDollarEl.textContent = cargoDollar.toFixed(2) + "$";
        if (cargoRubleEl)
          cargoRubleEl.textContent = cargoRuble.toFixed(2) + "₽";
      } else {
        // calc-customs
        if (tooltipTitle) {
          tooltipTitle.textContent = "Доставка только до г.Благовещенск СВХ";
        }
        if (whiteBlock) {
          whiteBlock.classList.add("active");
        }
        // Курс ЦБ
        if (rubleSpan) rubleSpan.textContent = cbrRuble?.toFixed?.(2) || "0.00";
        if (yuanSpan) yuanSpan.textContent = cbrYuan?.toFixed?.(2) || "0.00";

        // Пошлина
        if (chosenImpEl && dutyValue !== undefined) {
          chosenImpEl.textContent = dutyValue + "%";
        }
        // НДС
        if (ndsEl && ndsValue !== undefined) {
          ndsEl.textContent = ndsValue + "%";
        }
        // 550 юаней (declRub) => в $?
        if (declDollarEl && declRubleEl && declRub !== undefined) {
          // declRub уже в рублях => declRub / cbrRuble => $
          const decDollar = cbrRuble > 0 ? declRub / cbrRuble : 0;
          declDollarEl.textContent = decDollar.toFixed(2) + "$";
          declRubleEl.textContent = declRub.toFixed(2) + "₽";
        }
        // ._all-white-dollar/._all-white-ruble => таможня (duty+nds+dec) минус исходная стоим.
        if (allWhiteDollarEl && allWhiteRubleEl) {
          // допустим totalAllDollar - cargoDollar = чисто тамож.часть
          // но вы можете передавать отдельное поле totalCustomsDollar/totalCustomsRub
          const customsDollarOnly = (totalAllDollar || 0) - cargoDollar;
          const customsRubleOnly = (totalAllRub || 0) - cargoRuble;
          allWhiteDollarEl.textContent = customsDollarOnly.toFixed(2) + "$";
          allWhiteRubleEl.textContent = customsRubleOnly.toFixed(2) + "₽";
        }
        // "Перевозка + Таможенные расходы" => ._all-calculated-price-dollar/._ruble
        if (allCalculatedDollarEl && allCalculatedRubleEl) {
          const finalDollarStr = (totalAllDollar || 0).toFixed(2);
          const finalRubleStr = (totalAllRub || 0).toFixed(2);
          allCalculatedDollarEl.textContent = finalDollarStr + "$";
          allCalculatedRubleEl.textContent = finalRubleStr + "₽";
        }
      }
    }); // end forEach

    // Выводим *все* строки в консоль
    console.table(bigConsoleRows);

    // Активируем общий блок .main-calc-result
    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) resultBlock.classList.add("active");
  }
}
